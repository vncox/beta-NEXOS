require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { testConnection, syncDatabase } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Importar rutas
const authRoutes = require('./routes/auth');
const subastasRoutes = require('./routes/subastas');
const walletRoutes = require('./routes/wallet');
const rifasRoutes = require('./routes/rifas');
const productosRoutes = require('./routes/productos');
const causasRoutes = require('./routes/causas');
const donacionesRoutes = require('./routes/donaciones');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 4000;

// ============================================
// MIDDLEWARE
// ============================================

// Seguridad
app.use(helmet());

// CORS - Configuración mejorada
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requests sin origin (como Postman, Thunder Client)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Rate limiting (muy permisivo para desarrollo)
const limiter = rateLimit({
    windowMs: 15 * 1000, // 15 segundos (ventana más corta)
    max: 100, // 100 requests cada 15 segundos (400 req/min)
    message: 'Demasiadas peticiones, por favor intenta de nuevo más tarde.',
    standardHeaders: true, // Retorna info de rate limit en los headers
    legacyHeaders: false, // Deshabilita headers legacy (X-RateLimit-*)
    skipSuccessfulRequests: false, // Contar requests exitosas
    skipFailedRequests: false // Contar requests fallidas también
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compresión
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ============================================
// RUTAS
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Rutas de API
console.log('📌 Montando rutas de API...');
app.use('/api/auth', authRoutes);
app.use('/api/subastas', subastasRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/rifas', rifasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/causas', causasRoutes);
app.use('/api/donaciones', donacionesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);
console.log('✅ Rutas montadas correctamente');

// ============================================
// MANEJO DE ERRORES
// ============================================

// Ruta no encontrada
app.use(notFound);

// Error handler global
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================

const startServer = async () => {
    try {
        // Conectar a la base de datos
        await testConnection();
        console.log('✅ Conexión a PostgreSQL establecida');

        // Sincronizar modelos (solo en desarrollo)
        if (process.env.NODE_ENV !== 'production') {
            await syncDatabase();
            console.log('✅ Modelos sincronizados con la base de datos');
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
            console.log(`📍 http://localhost:${PORT}/api/health`);
            console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

// Iniciar
startServer();

module.exports = app;
