const { Donacion, Causa, User, Empresa } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtener todas las donaciones
 */
exports.getDonaciones = async (req, res, next) => {
    try {
        const {
            causaId,
            donadorId,
            tipoDonador,
            estado,
            limit = 20,
            offset = 0
        } = req.query;

        const where = {};

        if (causaId) where.causaId = causaId;
        if (donadorId) where.donadorId = donadorId;
        if (tipoDonador) where.tipoDonador = tipoDonador;
        if (estado) where.estado = estado;

        const donaciones = await Donacion.findAll({
            where,
            include: [
                { model: Causa, as: 'causa', attributes: ['id', 'titulo', 'imagen'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            donaciones,
            total: await Donacion.count({ where })
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener donación por ID
 */
exports.getDonacionById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const donacion = await Donacion.findByPk(id, {
            include: [
                { model: Causa, as: 'causa' }
            ]
        });

        if (!donacion) {
            return res.status(404).json({ error: 'Donación no encontrada' });
        }

        res.json(donacion);
    } catch (error) {
        next(error);
    }
};

/**
 * Crear donación
 */
exports.createDonacion = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const tipoDonador = req.user.role === 'empresa' ? 'empresa' : 'usuario';
        
        const {
            causaId,
            monto,
            mensaje
        } = req.body;

        // Verificar que la causa existe
        const causa = await Causa.findByPk(causaId);
        if (!causa) {
            return res.status(404).json({ error: 'Causa no encontrada' });
        }

        if (causa.estado !== 'activa') {
            return res.status(400).json({ error: 'La causa no está activa' });
        }

        // Verificar saldo del usuario
        const donador = tipoDonador === 'empresa' 
            ? await Empresa.findByPk(userId)
            : await User.findByPk(userId);

        const montoFloat = parseFloat(monto);
        
        if (parseFloat(donador.saldo) < montoFloat) {
            return res.status(400).json({ error: 'Saldo insuficiente' });
        }

        // Descontar saldo
        await donador.update({
            saldo: parseFloat(donador.saldo) - montoFloat
        });

        // Crear donación
        const donacion = await Donacion.create({
            causaId,
            donadorId: userId,
            tipoDonador,
            monto: montoFloat,
            mensaje,
            metodoPago: 'wallet',
            estado: 'completada'
        });

        // Actualizar recaudación de la causa
        await causa.update({
            recaudacionActual: parseFloat(causa.recaudacionActual || 0) + montoFloat
        });

        res.status(201).json({
            message: 'Donación realizada exitosamente',
            donacion
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener mis donaciones
 */
exports.getMisDonaciones = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const donaciones = await Donacion.findAll({
            where: { donadorId: userId },
            include: [
                { model: Causa, as: 'causa', attributes: ['id', 'nombre', 'imagen'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ donaciones });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener estadísticas de donaciones por causa
 */
exports.getEstadisticasDonaciones = async (req, res, next) => {
    try {
        const { causaId } = req.params;

        const donaciones = await Donacion.findAll({
            where: { 
                causaId,
                estado: 'completada'
            },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalDonaciones'],
                [sequelize.fn('SUM', sequelize.col('monto')), 'totalRecaudado'],
                [sequelize.fn('AVG', sequelize.col('monto')), 'promedioMonto']
            ]
        });

        res.json(donaciones[0]);
    } catch (error) {
        next(error);
    }
};
