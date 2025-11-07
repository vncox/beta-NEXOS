const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PasswordReset = sequelize.define('PasswordReset', {
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
    username: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    display_name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    tipo_cuenta: {
        type: DataTypes.ENUM('user', 'empresa'),
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada'),
        defaultValue: 'pendiente'
    },
    temp_password: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    motivo_rechazo: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    aprobado_por: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    fecha_decision: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'password_resets',
    timestamps: true,
    indexes: [
        { fields: ['usuario_id'] },
        { fields: ['empresa_id'] },
        { fields: ['estado'] },
        { fields: ['created_at'] }
    ]
});

module.exports = PasswordReset;
