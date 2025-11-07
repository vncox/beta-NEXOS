const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Empresa = sequelize.define('Empresa', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 50]
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [4, 100]
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    razon_social: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    nombre_empresa: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    rut: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    direccion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    sitio_web: {
        type: DataTypes.STRING(200),
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    logo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('empresa', 'admin'),
        defaultValue: 'empresa'
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada', 'suspendida'),
        defaultValue: 'pendiente'
    },
    motivo_rechazo: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    saldo: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    verificado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    ultimo_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    fecha_aprobacion: {
        type: DataTypes.DATE,
        allowNull: true
    },
    aprobada_por: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    configuraciones: {
        type: DataTypes.JSONB,
        defaultValue: {
            tema: 'light',
            idioma: 'es',
            notificaciones: true,
            emailNotificaciones: true,
            visibilidadPerfil: 'publico',
            recibirSolicitudes: true
        }
    }
}, {
    tableName: 'empresas',
    timestamps: true,
    indexes: [
        { fields: ['username'] },
        { fields: ['email'] },
        { fields: ['rut'] },
        { fields: ['estado'] },
        { fields: ['role'] }
    ],
    hooks: {
        beforeCreate: async (empresa) => {
            if (empresa.password) {
                const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
                empresa.password = await bcrypt.hash(empresa.password, salt);
            }
        },
        beforeUpdate: async (empresa) => {
            if (empresa.changed('password')) {
                const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
                empresa.password = await bcrypt.hash(empresa.password, salt);
            }
        }
    }
});

// Método para comparar contraseñas
Empresa.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para ocultar datos sensibles
Empresa.prototype.toSafeObject = function() {
    const empresa = this.toJSON();
    delete empresa.password;
    return empresa;
};

module.exports = Empresa;
