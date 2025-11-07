const { Puja, Subasta, User, Transaccion } = require('../models');
const { sequelize } = require('../config/database');

// Crear puja
exports.crearPuja = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const usuarioId = req.user.id;
        const { subasta_id, monto, automatica } = req.body;

        // Obtener subasta
        const subasta = await Subasta.findByPk(subasta_id, { transaction: t });

        if (!subasta) {
            await t.rollback();
            return res.status(404).json({ error: 'Subasta no encontrada' });
        }

        // Validaciones
        if (subasta.estado !== 'activa') {
            await t.rollback();
            return res.status(400).json({ error: 'Subasta no está activa' });
        }

        if (new Date() > subasta.fecha_fin) {
            await t.rollback();
            return res.status(400).json({ error: 'Subasta ha finalizado' });
        }

        if (new Date() < subasta.fecha_inicio) {
            await t.rollback();
            return res.status(400).json({ error: 'Subasta aún no ha iniciado' });
        }

        // Validar monto mínimo
        const montoMinimo = parseFloat(subasta.precio_actual) + parseFloat(subasta.incremento_minimo);
        if (parseFloat(monto) < montoMinimo) {
            await t.rollback();
            return res.status(400).json({
                error: `El monto debe ser al menos ${montoMinimo.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}`
            });
        }

        // Obtener usuario y validar saldo
        const usuario = await User.findByPk(usuarioId, { transaction: t });
        
        if (parseFloat(usuario.saldo) < parseFloat(monto)) {
            await t.rollback();
            return res.status(400).json({ error: 'Saldo insuficiente' });
        }

        // Verificar si el usuario ya tiene una puja activa en esta subasta
        const pujaAnterior = await Puja.findOne({
            where: {
                subasta_id,
                usuario_id: usuarioId,
                estado: 'activa'
            },
            transaction: t
        });

        // Si tiene puja anterior, devolver ese monto antes de descontar el nuevo
        if (pujaAnterior) {
            await usuario.increment('saldo', { by: parseFloat(pujaAnterior.monto), transaction: t });
            await pujaAnterior.update({ estado: 'superada' }, { transaction: t });
        }

        // Descontar nuevo monto del saldo
        await usuario.decrement('saldo', { by: parseFloat(monto), transaction: t });

        // Registrar transacción de puja
        const transaccion = await Transaccion.create({
            usuario_id: usuarioId,
            tipo: 'puja',
            concepto: `Puja en subasta: ${subasta.titulo}`,
            monto: monto,
            saldo_anterior: parseFloat(usuario.saldo) + parseFloat(monto),
            saldo_final: parseFloat(usuario.saldo),
            estado: 'completada',
            referencia_id: subasta_id,
            referencia_tipo: 'subasta'
        }, { transaction: t });

        // Crear puja
        const puja = await Puja.create({
            subasta_id,
            usuario_id: usuarioId,
            monto,
            automatica: automatica || false,
            transaction_id: transaccion.id,
            estado: 'activa'
        }, { transaction: t });

        // Actualizar precio actual y cantidad de pujas en subasta
        await subasta.update({
            precio_actual: monto,
            cantidad_pujas: subasta.cantidad_pujas + 1
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            message: 'Puja realizada exitosamente',
            puja,
            subasta: {
                id: subasta.id,
                precio_actual: monto,
                cantidad_pujas: subasta.cantidad_pujas + 1
            }
        });
    } catch (error) {
        await t.rollback();
        console.error('Error en crearPuja:', error);
        res.status(500).json({ error: 'Error al crear puja' });
    }
};

// Obtener pujas de una subasta
exports.getPujasSubasta = async (req, res) => {
    try {
        const { subasta_id } = req.params;
        const { limit = 50 } = req.query;

        const pujas = await Puja.findAll({
            where: { subasta_id },
            include: [{
                association: 'usuario',
                attributes: ['id', 'username', 'nombre', 'apellido']
            }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit)
        });

        res.json(pujas);
    } catch (error) {
        console.error('Error en getPujasSubasta:', error);
        res.status(500).json({ error: 'Error al obtener pujas' });
    }
};

// Obtener mis pujas
exports.getMisPujas = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const { page = 1, limit = 20, estado } = req.query;
        const offset = (page - 1) * limit;

        const where = { usuario_id: usuarioId };
        if (estado) where.estado = estado;

        const { count, rows } = await Puja.findAndCountAll({
            where,
            include: [{
                association: 'subasta',
                include: [{
                    association: 'empresa',
                    attributes: ['id', 'razon_social', 'username']
                }]
            }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            pujas: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error en getMisPujas:', error);
        res.status(500).json({ error: 'Error al obtener tus pujas' });
    }
};
