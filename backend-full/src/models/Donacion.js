const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Donacion = sequelize.define('Donacion', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    causa_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'causas',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    usuario_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    monto: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    anonimo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    mensaje: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    metodo_pago: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'completada', 'fallida', 'reembolsada'),
        defaultValue: 'completada'
    }
}, {
    tableName: 'donaciones',
    timestamps: true,
    indexes: [
        { fields: ['causa_id'] },
        { fields: ['usuario_id'] },
        { fields: ['estado'] },
        { fields: ['created_at'] }
    ]
});

module.exports = Donacion;
