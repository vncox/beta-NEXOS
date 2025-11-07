const { Rifa, BoletoRifa, Empresa, Causa, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtener todas las rifas con filtros
 */
exports.getRifas = async (req, res, next) => {
    try {
        const {
            estado,
            empresaId,
            causaId,
            limit = 20,
            offset = 0
        } = req.query;

        const where = {};

        if (estado) where.estado = estado;
        if (empresaId) where.empresaId = empresaId;
        if (causaId) where.causaId = causaId;

        const rifas = await Rifa.findAll({
            where,
            include: [
                { model: Empresa, as: 'empresa', attributes: ['id', 'razon_social', 'logo'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            rifas,
            total: await Rifa.count({ where })
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener una rifa por ID
 */
exports.getRifaById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const rifa = await Rifa.findByPk(id, {
            include: [
                { model: Empresa, as: 'empresa', attributes: ['id', 'razon_social', 'logo'] },
                {
                    model: BoletoRifa,
                    as: 'boletos',
                    include: [{ model: User, as: 'usuario', attributes: ['id', 'nombre', 'apellido'] }]
                }
            ]
        });

        if (!rifa) {
            return res.status(404).json({ success: false, error: 'Rifa no encontrada' });
        }

        res.json({ success: true, rifa });
    } catch (error) {
        next(error);
    }
};

/**
 * Crear una nueva rifa (solo empresas)
 */
exports.createRifa = async (req, res, next) => {
    try {
        const empresaId = req.user.id;
        const {
            nombre,
            descripcion,
            precioNumero,
            numerosTotales,
            fechaSorteo,
            causaId,
            imagenes,
            premio,
            reglamento
        } = req.body;

        const rifa = await Rifa.create({
            empresaId,
            causaId,
            nombre,
            descripcion,
            precioNumero: parseFloat(precioNumero),
            numerosTotales: parseInt(numerosTotales),
            numerosVendidos: 0,
            fechaSorteo: new Date(fechaSorteo),
            premio,
            reglamento,
            imagenes: imagenes || [],
            estado: 'borrador'
        });

        res.status(201).json({
            message: 'Rifa creada exitosamente',
            rifa
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar una rifa
 */
exports.updateRifa = async (req, res, next) => {
    try {
        const { id } = req.params;
        const empresaId = req.user.id;

        const rifa = await Rifa.findByPk(id);

        if (!rifa) {
            return res.status(404).json({ error: 'Rifa no encontrada' });
        }

        // Solo la empresa dueña puede actualizar (o admin)
        if (rifa.empresaId !== empresaId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'No autorizado' });
        }

        // No permitir actualización si ya está publicada o finalizada
        if (rifa.estado === 'finalizada') {
            return res.status(400).json({ error: 'No se puede modificar una rifa finalizada' });
        }

        const {
            nombre,
            descripcion,
            precioNumero,
            fechaSorteo,
            imagenes,
            premio,
            reglamento
        } = req.body;

        await rifa.update({
            nombre: nombre || rifa.nombre,
            descripcion: descripcion || rifa.descripcion,
            precioNumero: precioNumero ? parseFloat(precioNumero) : rifa.precioNumero,
            fechaSorteo: fechaSorteo ? new Date(fechaSorteo) : rifa.fechaSorteo,
            premio: premio || rifa.premio,
            reglamento: reglamento || rifa.reglamento,
            imagenes: imagenes || rifa.imagenes
        });

        res.json({
            message: 'Rifa actualizada exitosamente',
            rifa
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar una rifa
 */
exports.deleteRifa = async (req, res, next) => {
    try {
        const { id } = req.params;
        const empresaId = req.user.id;

        const rifa = await Rifa.findByPk(id);

        if (!rifa) {
            return res.status(404).json({ error: 'Rifa no encontrada' });
        }

        if (rifa.empresaId !== empresaId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'No autorizado' });
        }

        // No permitir eliminar si tiene boletos vendidos
        if (rifa.numerosVendidos > 0) {
            return res.status(400).json({ error: 'No se puede eliminar una rifa con boletos vendidos' });
        }

        await rifa.destroy();

        res.json({ message: 'Rifa eliminada exitosamente' });
    } catch (error) {
        next(error);
    }
};

/**
 * Publicar una rifa
 */
exports.publicarRifa = async (req, res, next) => {
    try {
        const { id } = req.params;
        const empresaId = req.user.id;

        const rifa = await Rifa.findByPk(id);

        if (!rifa) {
            return res.status(404).json({ error: 'Rifa no encontrada' });
        }

        if (rifa.empresaId !== empresaId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'No autorizado' });
        }

        if (rifa.estado !== 'borrador') {
            return res.status(400).json({ error: 'La rifa ya está publicada' });
        }

        await rifa.update({ estado: 'activa' });

        res.json({
            message: 'Rifa publicada exitosamente',
            rifa
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Comprar boletos de rifa
 */
exports.comprarBoletos = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { numeros } = req.body; // Array de números a comprar

        const rifa = await Rifa.findByPk(id);

        if (!rifa) {
            return res.status(404).json({ error: 'Rifa no encontrada' });
        }

        if (rifa.estado !== 'activa') {
            return res.status(400).json({ error: 'La rifa no está activa' });
        }

        // Verificar fecha de sorteo
        if (new Date() > rifa.fechaSorteo) {
            return res.status(400).json({ error: 'La rifa ya cerró' });
        }

        // Verificar que los números no estén vendidos
        const boletosExistentes = await BoletoRifa.findAll({
            where: {
                rifaId: id,
                numero: { [Op.in]: numeros }
            }
        });

        if (boletosExistentes.length > 0) {
            return res.status(400).json({
                error: 'Algunos números ya fueron vendidos',
                numerosOcupados: boletosExistentes.map(b => b.numero)
            });
        }

        const montoTotal = rifa.precioNumero * numeros.length;

        // Verificar saldo del usuario
        const user = await User.findByPk(userId);
        if (parseFloat(user.saldo) < montoTotal) {
            return res.status(400).json({ error: 'Saldo insuficiente' });
        }

        // Descontar saldo
        await user.update({
            saldo: parseFloat(user.saldo) - montoTotal
        });

        // Crear boletos
        const boletos = await Promise.all(
            numeros.map(numero =>
                BoletoRifa.create({
                    rifaId: id,
                    compradorId: userId,
                    numero: parseInt(numero),
                    estado: 'pagado'
                })
            )
        );

        // Actualizar números vendidos
        await rifa.update({
            numerosVendidos: rifa.numerosVendidos + numeros.length
        });

        res.json({
            message: 'Boletos comprados exitosamente',
            boletos,
            montoTotal
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener mis boletos
 */
exports.getMisBoletos = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const boletos = await BoletoRifa.findAll({
            where: { compradorId: userId },
            include: [
                {
                    model: Rifa,
                    as: 'rifa',
                    include: [
                        { model: Empresa, as: 'empresa', attributes: ['id', 'razon_social'] }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ boletos });
    } catch (error) {
        next(error);
    }
};

/**
 * Finalizar rifa y sortear ganador
 */
exports.finalizarRifa = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { numeroGanador } = req.body;

        const rifa = await Rifa.findByPk(id);

        if (!rifa) {
            return res.status(404).json({ error: 'Rifa no encontrada' });
        }

        if (rifa.estado === 'finalizada') {
            return res.status(400).json({ error: 'La rifa ya fue finalizada' });
        }

        // Verificar que el número ganador exista
        const boletoGanador = await BoletoRifa.findOne({
            where: {
                rifaId: id,
                numero: parseInt(numeroGanador)
            }
        });

        if (!boletoGanador) {
            return res.status(400).json({ error: 'Número ganador no vendido' });
        }

        // Actualizar boleto ganador
        await boletoGanador.update({ estado: 'ganador' });

        // Finalizar rifa
        await rifa.update({
            estado: 'finalizada',
            numeroGanador: parseInt(numeroGanador)
        });

        res.json({
            message: 'Rifa finalizada exitosamente',
            rifa,
            ganador: boletoGanador
        });
    } catch (error) {
        next(error);
    }
};
