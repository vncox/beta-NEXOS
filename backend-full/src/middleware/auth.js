const jwt = require('jsonwebtoken');

// Middleware para verificar JWT
exports.authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Token inválido o expirado' });
            }

            req.user = decoded; // { id, username, role, tipo }
            next();
        });
    } catch (error) {
        console.error('Error en authenticateToken:', error);
        res.status(500).json({ error: 'Error al verificar autenticación' });
    }
};

// Middleware para verificar que sea usuario (no empresa)
exports.isUser = (req, res, next) => {
    if (req.user.tipo !== 'usuario') {
        return res.status(403).json({ error: 'Acceso solo para usuarios' });
    }
    next();
};

// Middleware para verificar que sea empresa
exports.isEmpresa = (req, res, next) => {
    if (req.user.tipo !== 'empresa') {
        return res.status(403).json({ error: 'Acceso solo para empresas' });
    }
    next();
};

// Middleware para verificar que sea admin
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso solo para administradores' });
    }
    next();
};

// Middleware opcional - continúa si hay token válido, sino sigue sin req.user
exports.optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return next();
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (!err) {
                req.user = decoded;
            }
            next();
        });
    } catch (error) {
        next();
    }
};
