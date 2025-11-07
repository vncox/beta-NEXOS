const { User, Empresa, Transaccion } = require('../models');
const { sequelize } = require('../config/database');

// Servicio de billetera - operaciones sobre el saldo

// Depositar fondos
exports.depositar = async (accountId, monto, tipo = 'usuario', metadata = {}) => {
    const t = await sequelize.transaction();

    try {
        let account;
        if (tipo === 'usuario') {
            account = await User.findByPk(accountId, { transaction: t });
        } else {
            account = await Empresa.findByPk(accountId, { transaction: t });
        }

        if (!account) {
            await t.rollback();
            throw new Error('Cuenta no encontrada');
        }

        const saldoAnterior = parseFloat(account.saldo);
        await account.increment('saldo', { by: parseFloat(monto), transaction: t });
        const saldoFinal = saldoAnterior + parseFloat(monto);

        // Registrar transacción
        const transaccion = await Transaccion.create({
            [tipo === 'usuario' ? 'usuario_id' : 'empresa_id']: accountId,
            tipo: 'deposito',
            concepto: metadata.concepto || 'Depósito de fondos',
            monto: monto,
            saldo_anterior: saldoAnterior,
            saldo_final: saldoFinal,
            estado: 'completada',
            transaction_id: metadata.transaction_id,
            referencia_id: metadata.referencia_id,
            referencia_tipo: metadata.referencia_tipo,
            metadata: metadata
        }, { transaction: t });

        await t.commit();

        return {
            success: true,
            transaccion,
            saldoNuevo: saldoFinal
        };
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

// Retirar fondos
exports.retirar = async (accountId, monto, tipo = 'usuario', metadata = {}) => {
    const t = await sequelize.transaction();

    try {
        let account;
        if (tipo === 'usuario') {
            account = await User.findByPk(accountId, { transaction: t });
        } else {
            account = await Empresa.findByPk(accountId, { transaction: t });
        }

        if (!account) {
            await t.rollback();
            throw new Error('Cuenta no encontrada');
        }

        if (parseFloat(account.saldo) < parseFloat(monto)) {
            await t.rollback();
            throw new Error('Saldo insuficiente');
        }

        const saldoAnterior = parseFloat(account.saldo);
        await account.decrement('saldo', { by: parseFloat(monto), transaction: t });
        const saldoFinal = saldoAnterior - parseFloat(monto);

        // Registrar transacción
        const transaccion = await Transaccion.create({
            [tipo === 'usuario' ? 'usuario_id' : 'empresa_id']: accountId,
            tipo: 'retiro',
            concepto: metadata.concepto || 'Retiro de fondos',
            monto: monto,
            saldo_anterior: saldoAnterior,
            saldo_final: saldoFinal,
            estado: 'pendiente', // Retiros quedan pendientes de aprobación
            transaction_id: metadata.transaction_id,
            metadata: metadata
        }, { transaction: t });

        await t.commit();

        return {
            success: true,
            transaccion,
            saldoNuevo: saldoFinal,
            message: 'Retiro solicitado. Será procesado en 24-48 horas.'
        };
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

// Transferir fondos entre cuentas
exports.transferir = async (fromId, toId, monto, fromTipo = 'usuario', toTipo = 'usuario', concepto = 'Transferencia') => {
    const t = await sequelize.transaction();

    try {
        let fromAccount, toAccount;

        if (fromTipo === 'usuario') {
            fromAccount = await User.findByPk(fromId, { transaction: t });
        } else {
            fromAccount = await Empresa.findByPk(fromId, { transaction: t });
        }

        if (toTipo === 'usuario') {
            toAccount = await User.findByPk(toId, { transaction: t });
        } else {
            toAccount = await Empresa.findByPk(toId, { transaction: t });
        }

        if (!fromAccount || !toAccount) {
            await t.rollback();
            throw new Error('Una o ambas cuentas no encontradas');
        }

        if (parseFloat(fromAccount.saldo) < parseFloat(monto)) {
            await t.rollback();
            throw new Error('Saldo insuficiente');
        }

        // Restar de origen
        const saldoOrigenAnterior = parseFloat(fromAccount.saldo);
        await fromAccount.decrement('saldo', { by: parseFloat(monto), transaction: t });
        const saldoOrigenFinal = saldoOrigenAnterior - parseFloat(monto);

        // Sumar a destino
        const saldoDestinoAnterior = parseFloat(toAccount.saldo);
        await toAccount.increment('saldo', { by: parseFloat(monto), transaction: t });
        const saldoDestinoFinal = saldoDestinoAnterior + parseFloat(monto);

        // Registrar transacciones
        const transaccionSalida = await Transaccion.create({
            [fromTipo === 'usuario' ? 'usuario_id' : 'empresa_id']: fromId,
            tipo: 'retiro',
            concepto: concepto,
            monto: monto,
            saldo_anterior: saldoOrigenAnterior,
            saldo_final: saldoOrigenFinal,
            estado: 'completada'
        }, { transaction: t });

        const transaccionEntrada = await Transaccion.create({
            [toTipo === 'usuario' ? 'usuario_id' : 'empresa_id']: toId,
            tipo: 'deposito',
            concepto: concepto,
            monto: monto,
            saldo_anterior: saldoDestinoAnterior,
            saldo_final: saldoDestinoFinal,
            estado: 'completada'
        }, { transaction: t });

        await t.commit();

        return {
            success: true,
            transaccionSalida,
            transaccionEntrada
        };
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

// Obtener saldo
exports.getSaldo = async (accountId, tipo = 'usuario') => {
    try {
        let account;
        if (tipo === 'usuario') {
            account = await User.findByPk(accountId, { attributes: ['id', 'saldo'] });
        } else {
            account = await Empresa.findByPk(accountId, { attributes: ['id', 'saldo'] });
        }

        if (!account) {
            throw new Error('Cuenta no encontrada');
        }

        return {
            saldo: parseFloat(account.saldo)
        };
    } catch (error) {
        throw error;
    }
};
