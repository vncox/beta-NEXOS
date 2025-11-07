const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación y rol de admin
router.use(authenticateToken);
router.use(isAdmin);

// Estadísticas
router.get('/estadisticas', adminController.getEstadisticas);

// Gestión de empresas
router.get('/empresas', adminController.getEmpresas);
router.put('/empresas/:id/aprobar', adminController.aprobarEmpresa);
router.put('/empresas/:id/rechazar', adminController.rechazarEmpresa);
router.put('/empresas/:id/toggle-activo', adminController.toggleEmpresaActiva);
router.delete('/empresas/:id', adminController.deleteEmpresa);

// Gestión de usuarios
router.get('/usuarios', adminController.getUsuarios);
router.put('/usuarios/:id/toggle-activo', adminController.toggleUsuarioActivo);
router.delete('/usuarios/:id', adminController.deleteUsuario);

// Gestión de subastas
router.get('/subastas', adminController.getSubastasAdmin);

// Reportes
router.get('/reportes/transacciones', adminController.getReporteTransacciones);
router.get('/reportes/donaciones', adminController.getReporteDonaciones);

module.exports = router;
