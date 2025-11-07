const { Subasta, Puja, Empresa, User, Transaccion } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Listar subastas (con filtros y paginación)
exports.listSubastas = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            estado,
            tipo,
            empresa_id,
            destacada,
            search,
            orderBy = 'created_at',
            order = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        // Filtros
        if (estado) where.estado = estado;
        if (tipo) where.tipo = tipo;
        if (empresa_id) where.empresa_id = empresa_id;
        if (destacada !== undefined) where.destacada = destacada === 'true';
        if (search) {
            where[Op.or] = [
                { titulo: { [Op.iLike]: `%${search}%` } },
                { descripcion: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Subasta.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[orderBy, order.toUpperCase()]],
            include: [
                {
                    association: 'empresa',
                    attributes: ['id', 'razon_social', 'username', 'logo']
                },
                {
                    association: 'pujas',
                    separate: true,
                    limit: 1,
                    order: [['monto', 'DESC']]
                }
            ]
        });

        res.json({
            subastas: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error en listSubastas:', error);
        res.status(500).json({ error: 'Error al listar subastas' });
    }
};

// Obtener detalle de subasta
exports.getSubasta = async (req, res) => {
    try {
        const { id } = req.params;

        const subasta = await Subasta.findByPk(id, {
            include: [
                {
                    association: 'empresa',
                    attributes: ['id', 'razon_social', 'username', 'logo', 'descripcion']
                },
                {
                    association: 'pujas',
                    include: [{
                        association: 'usuario',
                        attributes: ['id', 'username', 'nombre', 'apellido']
                    }],
                    order: [['monto', 'DESC']],
                    limit: 20
                },
                {
                    association: 'ganador',
                    attributes: ['id', 'username', 'nombre', 'apellido']
                }
            ]
        });

        if (!subasta) {
            return res.status(404).json({ error: 'Subasta no encontrada' });
        }

        // TODO: Incrementar visitas (columna no existe aún en BD)
        // await subasta.increment('visitas');

        res.json(subasta);
    } catch (error) {
        console.error('Error en getSubasta:', error);
        res.status(500).json({ error: 'Error al obtener subasta' });
    }
};

// Crear subasta (solo empresas)
exports.createSubasta = async (req, res) => {
    try {
        const empresaId = req.user.id;
        const {
            titulo,
            descripcion,
            tipo,
            precio_inicial,
            precio_reserva,
            incremento_minimo,
            fecha_inicio,
            fecha_fin,
            imagenes,
            categoria,
            etiquetas,
            destacada,
            metadata
        } = req.body;

        // Validar fechas
        const inicio = new Date(fecha_inicio);
        const fin = new Date(fecha_fin);
        if (fin <= inicio) {
            return res.status(400).json({ error: 'Fecha de fin debe ser posterior a fecha de inicio' });
        }

        const subasta = await Subasta.create({
            empresa_id: empresaId,
            titulo,
            descripcion,
            tipo,
            imagenes: imagenes || [],
            precio_inicial,
            precio_actual: precio_inicial,
            precio_reserva,
            incremento_minimo: incremento_minimo || (precio_inicial * 0.05), // 5% por defecto
            fecha_inicio: inicio,
            fecha_fin: fin,
            categoria,
            etiquetas: etiquetas || [],
            destacada: destacada || false,
            metadata: metadata || {},
            estado: inicio <= new Date() ? 'activa' : 'activa' // Se puede agregar lógica para 'programada'
        });

        res.status(201).json({
            message: 'Subasta creada exitosamente',
            subasta
        });
    } catch (error) {
        console.error('Error en createSubasta:', error);
        res.status(500).json({ error: 'Error al crear subasta' });
    }
};

// Actualizar subasta
exports.updateSubasta = async (req, res) => {
    try {
        const { id } = req.params;
        const empresaId = req.user.id;
        const updates = req.body;

        const subasta = await Subasta.findByPk(id);

        if (!subasta) {
            return res.status(404).json({ error: 'Subasta no encontrada' });
        }

        // Verificar propiedad
        if (subasta.empresa_id !== empresaId) {
            return res.status(403).json({ error: 'No tienes permiso para editar esta subasta' });
        }

        // No permitir editar ciertos campos si ya hay pujas
        if (subasta.cantidad_pujas > 0) {
            delete updates.precio_inicial;
            delete updates.incremento_minimo;
            delete updates.tipo;
        }

        // No permitir campos críticos
        delete updates.id;
        delete updates.empresa_id;
        delete updates.precio_actual;
        delete updates.cantidad_pujas;
        delete updates.ganador_id;
        delete updates.visitas;

        await subasta.update(updates);

        res.json({
            message: 'Subasta actualizada exitosamente',
            subasta
        });
    } catch (error) {
        console.error('Error en updateSubasta:', error);
        res.status(500).json({ error: 'Error al actualizar subasta' });
    }
};

// Cancelar subasta
exports.cancelSubasta = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { id } = req.params;
        const empresaId = req.user.id;

        const subasta = await Subasta.findByPk(id, { transaction: t });

        if (!subasta) {
            await t.rollback();
            return res.status(404).json({ error: 'Subasta no encontrada' });
        }

        if (subasta.empresa_id !== empresaId) {
            await t.rollback();
            return res.status(403).json({ error: 'No tienes permiso para cancelar esta subasta' });
        }

        if (subasta.estado === 'finalizada') {
            await t.rollback();
            return res.status(400).json({ error: 'No se puede cancelar una subasta finalizada' });
        }

        // Devolver saldo a todos los pujadores
        const pujas = await Puja.findAll({
            where: {
                subasta_id: id,
                estado: 'activa'
            },
            transaction: t
        });

        for (const puja of pujas) {
            const usuario = await User.findByPk(puja.usuario_id, { transaction: t });
            
            // Devolver saldo
            await usuario.increment('saldo', { by: parseFloat(puja.monto), transaction: t });

            // Registrar transacción de devolución
            await Transaccion.create({
                usuario_id: puja.usuario_id,
                tipo: 'devolucion',
                concepto: `Devolución por cancelación de subasta: ${subasta.titulo}`,
                monto: puja.monto,
                saldo_anterior: parseFloat(usuario.saldo) - parseFloat(puja.monto),
                saldo_final: parseFloat(usuario.saldo),
                estado: 'completada',
                referencia_id: id,
                referencia_tipo: 'subasta'
            }, { transaction: t });

            // Marcar puja como devuelta
            await puja.update({
                estado: 'devuelta',
                fecha_devolucion: new Date()
            }, { transaction: t });
        }

        // Cancelar subasta
        await subasta.update({ estado: 'cancelada' }, { transaction: t });

        await t.commit();

        res.json({
            message: 'Subasta cancelada y fondos devueltos exitosamente',
            subasta
        });
    } catch (error) {
        await t.rollback();
        console.error('Error en cancelSubasta:', error);
        res.status(500).json({ error: 'Error al cancelar subasta' });
    }
};

// Finalizar subasta (automático o manual)
exports.finalizarSubasta = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { id } = req.params;
        const subasta = await Subasta.findByPk(id, { transaction: t });

        if (!subasta) {
            await t.rollback();
            return res.status(404).json({ error: 'Subasta no encontrada' });
        }

        if (subasta.estado === 'finalizada') {
            await t.rollback();
            return res.status(400).json({ error: 'Subasta ya finalizada' });
        }

        // Obtener puja ganadora
        const pujaGanadora = await Puja.findOne({
            where: { subasta_id: id },
            order: [['monto', 'DESC']],
            transaction: t
        });

        if (pujaGanadora) {
            // Verificar precio de reserva
            if (subasta.precio_reserva && parseFloat(pujaGanadora.monto) < parseFloat(subasta.precio_reserva)) {
                // No se alcanzó el precio de reserva - devolver todas las pujas
                const todasPujas = await Puja.findAll({
                    where: { subasta_id: id, estado: 'activa' },
                    transaction: t
                });

                for (const puja of todasPujas) {
                    const usuario = await User.findByPk(puja.usuario_id, { transaction: t });
                    await usuario.increment('saldo', { by: parseFloat(puja.monto), transaction: t });
                    
                    await Transaccion.create({
                        usuario_id: puja.usuario_id,
                        tipo: 'devolucion',
                        concepto: `Devolución - no se alcanzó precio de reserva: ${subasta.titulo}`,
                        monto: puja.monto,
                        saldo_anterior: parseFloat(usuario.saldo) - parseFloat(puja.monto),
                        saldo_final: parseFloat(usuario.saldo),
                        estado: 'completada'
                    }, { transaction: t });

                    await puja.update({ estado: 'devuelta', fecha_devolucion: new Date() }, { transaction: t });
                }

                await subasta.update({ estado: 'finalizada' }, { transaction: t });
                await t.commit();

                return res.json({
                    message: 'Subasta finalizada sin ganador (no se alcanzó precio de reserva)',
                    subasta
                });
            }

            // Hay ganador
            await pujaGanadora.update({ estado: 'ganadora' }, { transaction: t });
            
            // Transferir fondos a la empresa
            const empresa = await Empresa.findByPk(subasta.empresa_id, { transaction: t });
            await empresa.increment('saldo', { by: parseFloat(pujaGanadora.monto), transaction: t });

            await Transaccion.create({
                empresa_id: empresa.id,
                tipo: 'venta',
                concepto: `Venta por subasta: ${subasta.titulo}`,
                monto: pujaGanadora.monto,
                saldo_anterior: parseFloat(empresa.saldo) - parseFloat(pujaGanadora.monto),
                saldo_final: parseFloat(empresa.saldo),
                estado: 'completada',
                referencia_id: id,
                referencia_tipo: 'subasta'
            }, { transaction: t });

            // Devolver fondos a los demás pujadores
            const otrasPujas = await Puja.findAll({
                where: {
                    subasta_id: id,
                    estado: 'activa',
                    id: { [Op.ne]: pujaGanadora.id }
                },
                transaction: t
            });

            for (const puja of otrasPujas) {
                const usuario = await User.findByPk(puja.usuario_id, { transaction: t });
                await usuario.increment('saldo', { by: parseFloat(puja.monto), transaction: t });

                await Transaccion.create({
                    usuario_id: puja.usuario_id,
                    tipo: 'devolucion',
                    concepto: `Devolución de puja no ganadora: ${subasta.titulo}`,
                    monto: puja.monto,
                    saldo_anterior: parseFloat(usuario.saldo) - parseFloat(puja.monto),
                    saldo_final: parseFloat(usuario.saldo),
                    estado: 'completada'
                }, { transaction: t });

                await puja.update({ estado: 'devuelta', fecha_devolucion: new Date() }, { transaction: t });
            }

            await subasta.update({
                estado: 'finalizada',
                ganador_id: pujaGanadora.usuario_id
            }, { transaction: t });

            await t.commit();

            res.json({
                message: 'Subasta finalizada exitosamente',
                subasta,
                ganador: pujaGanadora
            });
        } else {
            // No hay pujas
            await subasta.update({ estado: 'finalizada' }, { transaction: t });
            await t.commit();

            res.json({
                message: 'Subasta finalizada sin pujas',
                subasta
            });
        }
    } catch (error) {
        await t.rollback();
        console.error('Error en finalizarSubasta:', error);
        res.status(500).json({ error: 'Error al finalizar subasta' });
    }
};
