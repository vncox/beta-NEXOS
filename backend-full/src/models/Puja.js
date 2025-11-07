const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Puja = sequelize.define('Puja', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    subasta_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'subastas',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    usuario_id: {
        type: DataTypes.UUID,
        allowNull: false,
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
    automatica: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    estado: {
        type: DataTypes.ENUM('activa', 'superada', 'ganadora', 'devuelta'),
        defaultValue: 'activa'
    },
    transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    fecha_devolucion: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'pujas',
    timestamps: true,
    indexes: [
        { fields: ['subasta_id'] },
        { fields: ['usuario_id'] },
        { fields: ['estado'] },
        { fields: ['monto'] },
        { fields: ['created_at'] }
    ]
});

module.exports = Puja;
