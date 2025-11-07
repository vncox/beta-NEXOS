const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subasta = sequelize.define('Subasta', {
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
    tipo: {
        type: DataTypes.ENUM('producto', 'servicio', 'arte', 'coleccionable', 'otro'),
        defaultValue: 'producto'
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: true
    },
    imagenes: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    precio_inicial: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    precio_actual: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    precio_reserva: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    incremento_minimo: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 1000,
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
        type: DataTypes.ENUM('activa', 'finalizada', 'cancelada', 'pausada'),
        defaultValue: 'activa'
    },
    ganador_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    cantidad_pujas: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    categoria: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    etiquetas: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    destacada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    tableName: 'subastas',
    timestamps: true,
    indexes: [
        { fields: ['empresa_id'] },
        { fields: ['estado'] },
        { fields: ['fecha_fin'] },
        { fields: ['precio_actual'] },
        { fields: ['destacada'] }
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

module.exports = Subasta;
