const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Perfil
router.get('/perfil', userController.getPerfil);
router.put('/perfil', userController.updatePerfil);

// Contraseña
router.put('/password', userController.cambiarPassword);

// Historial
router.get('/historial/pujas', userController.getHistorialPujas);
router.get('/historial/compras', userController.getHistorialCompras);
router.get('/historial/rifas', userController.getParticipacionRifas);

// Cuenta
router.delete('/cuenta', userController.eliminarCuenta);

module.exports = router;
