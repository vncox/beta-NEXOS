const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Rifa = sequelize.define('Rifa', {
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
    imagen: {
        type: DataTypes.STRING,
        allowNull: true
    },
    imagenes: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    precio_boleto: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    boletos_totales: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    boletos_vendidos: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    fecha_sorteo: {
        type: DataTypes.DATE,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('activa', 'finalizada', 'sorteada', 'cancelada'),
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
    numero_ganador: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    fecha_sorteo_realizado: {
        type: DataTypes.DATE,
        allowNull: true
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
    tableName: 'rifas',
    timestamps: true,
    indexes: [
        { fields: ['empresa_id'] },
        { fields: ['estado'] },
        { fields: ['fecha_sorteo'] },
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

module.exports = Rifa;
