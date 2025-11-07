const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Causa = sequelize.define('Causa', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    empresa_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'empresas',
            key: 'id'
        }
    },
    titulo: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    historia: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: true
    },
    imagenes: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    meta_recaudacion: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    monto_recaudado: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: false
    },
    fecha_fin: {
        type: DataTypes.DATE,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('activa', 'finalizada', 'pausada', 'cancelada'),
        defaultValue: 'activa'
    },
    categoria: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    total_donantes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    destacada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verificada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    ubicacion: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    etiquetas: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    tableName: 'causas',
    timestamps: true,
    indexes: [
        { fields: ['empresa_id'] },
        { fields: ['estado'] },
        { fields: ['categoria'] },
        { fields: ['destacada'] },
        { fields: ['fecha_fin'] }
    ]
});

module.exports = Causa;
