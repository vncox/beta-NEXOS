const { User, Empresa, Subasta, Puja, Causa, Donacion, Transaccion } = require('../models');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Obtener estadísticas generales del sistema
 */
exports.getEstadisticas = async (req, res, next) => {
    try {
        const [
            totalUsuarios,
            totalEmpresas,
            totalSubastas,
            totalCausas,
            empresasPendientes,
            empresasActivas
        ] = await Promise.all([
            User.count(),
            Empresa.count(),
            Subasta.count(),
            Causa.count(),
            Empresa.count({ where: { estado: 'pendiente' } }),
            Empresa.count({ where: { estado: 'aprobada' } })
        ]);

        // Recaudación total
        const transacciones = await Transaccion.findAll({
            where: { estado: 'completada' },
            attributes: [[Sequelize.fn('SUM', Sequelize.col('monto')), 'total']]
        });
        const totalRecaudado = parseFloat(transacciones[0]?.dataValues?.total || 0);

        res.json({
            totalUsuarios,
            totalEmpresas,
            empresasPendientes,
            empresasActivas,
            totalSubastas,
            totalCausas,
            totalRecaudado
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener todas las empresas con filtros
 */
exports.getEmpresas = async (req, res, next) => {
    try {
        const { estado, limit = 20, offset = 0 } = req.query;
        const where = {};
        
        if (estado) where.estado = estado;

        const empresas = await Empresa.findAll({
            where,
            attributes: { exclude: ['password'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            empresas,
            total: await Empresa.count({ where })
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Aprobar empresa
 */
exports.aprobarEmpresa = async (req, res, next) => {
    try {
        const { id } = req.params;

        const empresa = await Empresa.findByPk(id);
        if (!empresa) {
            return res.status(404).json({ error: 'Empresa no encontrada' });
        }

        await empresa.update({ estado: 'aprobada' });

        res.json({
            message: 'Empresa aprobada exitosamente',
            empresa
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Rechazar empresa
 */
exports.rechazarEmpresa = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;

        const empresa = await Empresa.findByPk(id);
        if (!empresa) {
            return res.status(404).json({ error: 'Empresa no encontrada' });
        }

        await empresa.update({ 
            estado: 'rechazada',
            motivoRechazo: motivo 
        });

        res.json({
            message: 'Empresa rechazada',
            empresa
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener todos los usuarios
 */
exports.getUsuarios = async (req, res, next) => {
    try {
        const { role, activo, limit = 20, offset = 0 } = req.query;
        const where = {};
        
        if (role) where.role = role;
        if (activo !== undefined) where.activo = activo === 'true';

        const usuarios = await User.findAll({
            where,
            attributes: { exclude: ['password'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            usuarios,
            total: await User.count({ where })
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Activar/desactivar usuario
 */
exports.toggleUsuarioActivo = async (req, res, next) => {
    try {
        const { id } = req.params;

        const usuario = await User.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await usuario.update({ activo: !usuario.activo });

        res.json({
            message: `Usuario ${usuario.activo ? 'activado' : 'desactivado'} exitosamente`,
            usuario
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar usuario
 */
exports.deleteUsuario = async (req, res, next) => {
    try {
        const { id } = req.params;

        // No permitir eliminar admin
        const usuario = await User.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (usuario.role === 'admin') {
            return res.status(400).json({ error: 'No se puede eliminar un administrador' });
        }

        await usuario.destroy();

        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener todas las subastas para admin
 */
exports.getSubastasAdmin = async (req, res, next) => {
    try {
        const { estado, empresaId, limit = 50, offset = 0 } = req.query;
        const where = {};
        
        if (estado) where.estado = estado;
        if (empresaId) where.empresaId = empresaId;

        const subastas = await Subasta.findAll({
            where,
            include: [
                { 
                    model: Empresa, 
                    as: 'empresa', 
                    attributes: ['id', 'razon_social', 'email', 'username'] 
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            subastas,
            total: await Subasta.count({ where })
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener reporte de transacciones
 */
exports.getReporteTransacciones = async (req, res, next) => {
    try {
        const { fechaInicio, fechaFin, tipo, limit = 100, offset = 0 } = req.query;
        const where = {};
        
        if (tipo) where.tipo = tipo;
        
        if (fechaInicio && fechaFin) {
            where.createdAt = {
                [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
            };
        }

        const transacciones = await Transaccion.findAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        // Calcular totales por tipo
        const totalesPorTipo = await Transaccion.findAll({
            where,
            attributes: [
                'tipo',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'cantidad'],
                [Sequelize.fn('SUM', Sequelize.col('monto')), 'total']
            ],
            group: ['tipo']
        });

        res.json({
            transacciones,
            total: await Transaccion.count({ where }),
            totalesPorTipo
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener reporte de donaciones por causa
 */
exports.getReporteDonaciones = async (req, res, next) => {
    try {
        const donacionesPorCausa = await Donacion.findAll({
            where: { estado: 'completada' },
            include: [
                { model: Causa, as: 'causa', attributes: ['id', 'nombre'] }
            ],
            attributes: [
                'causaId',
                [Sequelize.fn('COUNT', Sequelize.col('Donacion.id')), 'totalDonaciones'],
                [Sequelize.fn('SUM', Sequelize.col('Donacion.monto')), 'totalRecaudado']
            ],
            group: ['causaId', 'causa.id', 'causa.nombre'],
            order: [[Sequelize.fn('SUM', Sequelize.col('Donacion.monto')), 'DESC']]
        });

        res.json({ donacionesPorCausa });
    } catch (error) {
        next(error);
    }
};

/**
 * Activar/desactivar empresa
 */
exports.toggleEmpresaActiva = async (req, res, next) => {
    try {
        const { id } = req.params;
        const empresa = await Empresa.findByPk(id);

        if (!empresa) {
            return res.status(404).json({ error: 'Empresa no encontrada' });
        }

        // Toggle el estado bloqueado/activo
        empresa.bloqueado = !empresa.bloqueado;
        await empresa.save();

        res.json({
            message: empresa.bloqueado ? 'Empresa bloqueada' : 'Empresa activada',
            empresa
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar empresa
 */
exports.deleteEmpresa = async (req, res, next) => {
    try {
        const { id } = req.params;
        const empresa = await Empresa.findByPk(id);

        if (!empresa) {
            return res.status(404).json({ error: 'Empresa no encontrada' });
        }

        // Cancelar todas las subastas activas de la empresa
        await Subasta.update(
            { 
                estado: 'cancelada',
                metadata: sequelize.fn('jsonb_set', 
                    sequelize.col('metadata'), 
                    '{motivoCancelacion}', 
                    sequelize.literal("'\"Empresa eliminada del sistema\"'::jsonb")
                )
            },
            { 
                where: { 
                    empresa_id: id, 
                    estado: 'activa' 
                } 
            }
        );

        // Eliminar la empresa
        await empresa.destroy();

        res.json({ message: 'Empresa eliminada exitosamente' });
    } catch (error) {
        next(error);
    }
};

