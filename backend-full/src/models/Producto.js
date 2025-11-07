const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Producto = sequelize.define('Producto', {
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
    nombre: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    precio: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    precio_oferta: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    stock_inicial: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: true
    },
    imagenes: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    categoria: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('disponible', 'agotado', 'pausado', 'eliminado'),
        defaultValue: 'disponible'
    },
    destacado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    etiquetas: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    sku: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    peso: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    dimensiones: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    visitas: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    ventas: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0,
        validate: {
            min: 0,
            max: 5
        }
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    tableName: 'productos',
    timestamps: true,
    indexes: [
        { fields: ['empresa_id'] },
        { fields: ['categoria'] },
        { fields: ['estado'] },
        { fields: ['destacado'] },
        { fields: ['precio'] }
    ],
    getterMethods: {
        imagen() {
            // Si no hay imagen singular pero hay imagenes array, devolver la primera
            if (!this.getDataValue('imagen') && this.getDataValue('imagenes') && this.getDataValue('imagenes').length > 0) {
                return this.getDataValue('imagenes')[0];
            }
            return this.getDataValue('imagen');
        }
    }
});

module.exports = Producto;
