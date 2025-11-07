// Middleware global de manejo de errores
exports.errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Error de Sequelize - validación
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            error: 'Error de validación',
            details: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // Error de Sequelize - unique constraint
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            error: 'Ya existe un registro con esos datos',
            details: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // Error de Sequelize - foreign key constraint
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            error: 'Referencia inválida a otro registro'
        });
    }

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token inválido'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expirado'
        });
    }

    // Error de multer (archivos)
    if (err.name === 'MulterError') {
        return res.status(400).json({
            error: 'Error al subir archivo',
            details: err.message
        });
    }

    // Error genérico
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor'
    });
};

// Middleware para rutas no encontradas
exports.notFound = (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada'
    });
};
