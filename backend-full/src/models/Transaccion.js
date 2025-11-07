const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaccion = sequelize.define('Transaccion', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    usuario_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    empresa_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'empresas',
            key: 'id'
        }
    },
    tipo: {
        type: DataTypes.ENUM('deposito', 'retiro', 'compra', 'venta', 'puja', 'rifa', 'donacion', 'comision', 'devolucion'),
        allowNull: false
    },
    concepto: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    monto: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    saldo_anterior: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    saldo_final: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'completada', 'fallida', 'revertida'),
        defaultValue: 'completada'
    },
    metodo_pago: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true
    },
    referencia_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    referencia_tipo: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    tableName: 'transacciones',
    timestamps: true,
    indexes: [
        { fields: ['usuario_id'] },
        { fields: ['empresa_id'] },
        { fields: ['tipo'] },
        { fields: ['estado'] },
        { fields: ['transaction_id'] },
        { fields: ['created_at'] }
    ]
});

module.exports = Transaccion;
