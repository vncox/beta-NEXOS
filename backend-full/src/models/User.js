const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
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
            len: [3, 50],
            isAlphanumeric: true
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
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    rut: {
        type: DataTypes.STRING(20),
        allowNull: true,
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
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
    },
    saldo: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
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
    configuraciones: {
        type: DataTypes.JSONB,
        defaultValue: {
            tema: 'light',
            idioma: 'es',
            notificaciones: true,
            emailNotificaciones: true
        }
    }
}, {
    tableName: 'users',
    timestamps: true,
    indexes: [
        { fields: ['username'] },
        { fields: ['email'] },
        { fields: ['rut'] },
        { fields: ['role'] }
    ],
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Método para comparar contraseñas
User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para ocultar datos sensibles
User.prototype.toSafeObject = function() {
    const user = this.toJSON();
    delete user.password;
    return user;
};

module.exports = User;
