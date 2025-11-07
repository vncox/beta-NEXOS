const walletService = require('../services/walletService');
const { Transaccion } = require('../models');

// Depositar fondos
exports.depositar = async (req, res) => {
    try {
        const { id, tipo } = req.user;
        const { monto, metodo_pago, transaction_id } = req.body;

        if (!monto || parseFloat(monto) <= 0) {
            return res.status(400).json({ error: 'Monto inválido' });
        }

        const result = await walletService.depositar(id, monto, tipo, {
            concepto: `Depósito vía ${metodo_pago || 'Mercado Pago'}`,
            transaction_id,
            metodo_pago
        });

        res.json({
            message: 'Depósito realizado exitosamente',
            ...result
        });
    } catch (error) {
        console.error('Error en depositar:', error);
        res.status(500).json({ error: error.message || 'Error al depositar fondos' });
    }
};

// Solicitar retiro
exports.retirar = async (req, res) => {
    try {
        const { id, tipo } = req.user;
        const { monto, metodo_retiro, datos_bancarios } = req.body;

        if (!monto || parseFloat(monto) <= 0) {
            return res.status(400).json({ error: 'Monto inválido' });
        }

        if (!metodo_retiro || !datos_bancarios) {
            return res.status(400).json({ error: 'Método de retiro y datos bancarios son requeridos' });
        }

        const result = await walletService.retirar(id, monto, tipo, {
            concepto: `Retiro vía ${metodo_retiro}`,
            metodo_retiro,
            datos_bancarios
        });

        res.json({
            message: result.message,
            ...result
        });
    } catch (error) {
        console.error('Error en retirar:', error);
        res.status(500).json({ error: error.message || 'Error al retirar fondos' });
    }
};

// Obtener saldo
exports.getSaldo = async (req, res) => {
    try {
        const { id, tipo } = req.user;

        const result = await walletService.getSaldo(id, tipo);

        res.json(result);
    } catch (error) {
        console.error('Error en getSaldo:', error);
        res.status(500).json({ error: error.message || 'Error al obtener saldo' });
    }
};

// Obtener historial de transacciones
exports.getTransacciones = async (req, res) => {
    try {
        const { id, tipo } = req.user;
        const { page = 1, limit = 20, tipoTransaccion, estado } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (tipo === 'usuario') {
            where.usuario_id = id;
        } else {
            where.empresa_id = id;
        }

        if (tipoTransaccion) where.tipo = tipoTransaccion;
        if (estado) where.estado = estado;

        const { count, rows } = await Transaccion.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            transacciones: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error en getTransacciones:', error);
        res.status(500).json({ error: 'Error al obtener transacciones' });
    }
};

// Obtener detalle de transacción
exports.getTransaccion = async (req, res) => {
    try {
        const { id, tipo } = req.user;
        const { transaccion_id } = req.params;

        const where = { id: transaccion_id };
        if (tipo === 'usuario') {
            where.usuario_id = id;
        } else {
            where.empresa_id = id;
        }

        const transaccion = await Transaccion.findOne({ where });

        if (!transaccion) {
            return res.status(404).json({ error: 'Transacción no encontrada' });
        }

        res.json(transaccion);
    } catch (error) {
        console.error('Error en getTransaccion:', error);
        res.status(500).json({ error: 'Error al obtener transacción' });
    }
};
