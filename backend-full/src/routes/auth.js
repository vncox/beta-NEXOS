const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
    registerUserValidation,
    registerEmpresaValidation,
    loginValidation,
    validate
} = require('../middleware/validate');

// Rutas públicas
router.post('/register/user',
    registerUserValidation,
    validate,
    authController.registerUser
);

router.post('/register/empresa',
    registerEmpresaValidation,
    validate,
    authController.registerEmpresa
);

router.post('/login',
    loginValidation,
    validate,
    authController.login
);

// Rutas protegidas
router.get('/verify', authenticateToken, authController.verifyToken);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.post('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
