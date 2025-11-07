const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BoletoRifa = sequelize.define('BoletoRifa', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    rifa_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'rifas',
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
    numero: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM('vendido', 'ganador', 'perdedor'),
        defaultValue: 'vendido'
    },
    fecha_compra: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'boletos_rifa',
    timestamps: true,
    indexes: [
        { fields: ['rifa_id'] },
        { fields: ['usuario_id'] },
        { fields: ['numero'] },
        { fields: ['estado'] },
        { unique: true, fields: ['rifa_id', 'numero'] } // Un número por rifa
    ]
});

module.exports = BoletoRifa;
