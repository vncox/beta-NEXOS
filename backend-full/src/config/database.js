const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: process.env.DB_DIALECT || 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 5,
            min: parseInt(process.env.DB_POOL_MIN) || 0,
            acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
            idle: parseInt(process.env.DB_POOL_IDLE) || 10000
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        },
        timezone: '-03:00' // Chile timezone
    }
);

// Test connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error al conectar con PostgreSQL:', error.message);
        return false;
    }
};

// Sync database
const syncDatabase = async (options = {}) => {
    try {
        await sequelize.sync(options);
        console.log('✅ Base de datos sincronizada');
    } catch (error) {
        console.error('❌ Error al sincronizar base de datos:', error);
        throw error;
    }
};

module.exports = {
    sequelize,
    testConnection,
    syncDatabase
};
