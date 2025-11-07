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

/**
 * Obtener actividad reciente del sistema
 */
exports.getActividadReciente = async (req, res, next) => {
    try {
        const limite = parseInt(req.query.limite) || 10;

        // Obtener últimas transacciones
        const transacciones = await Transaccion.findAll({
            limit: limite,
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'usuario', attributes: ['id', 'nombre', 'apellido', 'username'] }
            ]
        });

        // Obtener últimas pujas
        const pujas = await Puja.findAll({
            limit: limite,
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'usuario', attributes: ['id', 'nombre', 'apellido', 'username'] },
                { model: Subasta, as: 'subasta', attributes: ['id', 'titulo'] }
            ]
        });

        // Obtener últimas empresas registradas
        const empresasNuevas = await Empresa.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'razon_social', 'estado', 'createdAt']
        });

        // Obtener últimos usuarios registrados
        const usuariosNuevos = await User.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'nombre', 'apellido', 'username', 'createdAt']
        });

        // Combinar y formatear actividades
        const actividades = [];

        // Agregar transacciones
        transacciones.forEach(t => {
            actividades.push({
                tipo: 'transaccion',
                icono: 'fa-exchange-alt',
                color: '#3498db',
                titulo: `Transacción de ${t.tipo}`,
                descripcion: `${t.usuario?.nombre || 'Usuario'} realizó una ${t.tipo} por $${t.monto.toLocaleString('es-CL')}`,
                fecha: t.createdAt,
                monto: t.monto
            });
        });

        // Agregar pujas
        pujas.forEach(p => {
            actividades.push({
                tipo: 'puja',
                icono: 'fa-gavel',
                color: '#9b59b6',
                titulo: 'Nueva puja en subasta',
                descripcion: `${p.usuario?.nombre || 'Usuario'} pujó $${p.monto.toLocaleString('es-CL')} en "${p.subasta?.titulo || 'Subasta'}"`,
                fecha: p.createdAt,
                monto: p.monto
            });
        });

        // Agregar empresas nuevas
        empresasNuevas.forEach(e => {
            actividades.push({
                tipo: 'empresa_registro',
                icono: 'fa-building',
                color: '#27ae60',
                titulo: 'Nueva empresa registrada',
                descripcion: `${e.razon_social} se registró (${e.estado})`,
                fecha: e.createdAt
            });
        });

        // Agregar usuarios nuevos
        usuariosNuevos.forEach(u => {
            actividades.push({
                tipo: 'usuario_registro',
                icono: 'fa-user-plus',
                color: '#f39c12',
                titulo: 'Nuevo usuario registrado',
                descripcion: `${u.nombre} ${u.apellido} (@${u.username}) se unió a la plataforma`,
                fecha: u.createdAt
            });
        });

        // Ordenar por fecha y limitar
        actividades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        const actividadesLimitadas = actividades.slice(0, limite);

        res.json({
            actividades: actividadesLimitadas,
            total: actividadesLimitadas.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener dashboard financiero completo
 */
exports.getDashboardFinanciero = async (req, res, next) => {
    try {
        // Obtener saldos totales
        const [usuariosResult, empresasResult] = await Promise.all([
            User.findAll({
                attributes: [
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
                    [Sequelize.fn('SUM', Sequelize.col('saldo')), 'saldoTotal']
                ]
            }),
            Empresa.findAll({
                where: { estado: 'aprobada' },
                attributes: [
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
                    [Sequelize.fn('SUM', Sequelize.col('saldo')), 'saldoTotal']
                ]
            })
        ]);

        const totalUsuarios = parseInt(usuariosResult[0]?.dataValues?.total || 0);
        const saldoTotalUsuarios = parseFloat(usuariosResult[0]?.dataValues?.saldoTotal || 0);
        const totalEmpresas = parseInt(empresasResult[0]?.dataValues?.total || 0);
        const saldoTotalEmpresas = parseFloat(empresasResult[0]?.dataValues?.saldoTotal || 0);

        // Obtener transacciones totales
        const transaccionesCount = await Transaccion.count({
            where: { estado: 'completada' }
        });

        const transaccionesSum = await Transaccion.findAll({
            where: { estado: 'completada' },
            attributes: [[Sequelize.fn('SUM', Sequelize.col('monto')), 'total']]
        });
        const circulacionTotal = parseFloat(transaccionesSum[0]?.dataValues?.total || 0);

        // Obtener subastas activas
        const subastasActivas = await Subasta.count({
            where: { estado: 'activa' }
        });

        // Obtener rifas activas (si existe el modelo Rifa)
        let rifasActivas = 0;
        try {
            const Rifa = require('../models').Rifa;
            if (Rifa) {
                rifasActivas = await Rifa.count({
                    where: { estado: 'activa' }
                });
            }
        } catch (error) {
            console.log('Modelo Rifa no encontrado');
        }

        // Obtener productos en venta (si existe el modelo Producto)
        let productosVenta = 0;
        try {
            const Producto = require('../models').Producto;
            if (Producto) {
                productosVenta = await Producto.count({
                    where: { estado: 'activo' }
                });
            }
        } catch (error) {
            console.log('Modelo Producto no encontrado');
        }

        res.json({
            usuarios: {
                total: totalUsuarios,
                saldoTotal: saldoTotalUsuarios
            },
            empresas: {
                total: totalEmpresas,
                saldoTotal: saldoTotalEmpresas
            },
            circulacion: {
                total: circulacionTotal,
                transacciones: transaccionesCount
            },
            subastas: {
                activas: subastasActivas
            },
            rifas: {
                activas: rifasActivas
            },
            productos: {
                enVenta: productosVenta
            }
        });
    } catch (error) {
        next(error);
    }
};

