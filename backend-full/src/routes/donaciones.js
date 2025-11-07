const express = require('express');
const router = express.Router();
const donacionesController = require('../controllers/donacionesController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Rutas públicas
router.get('/', donacionesController.getDonaciones);
router.get('/:id', donacionesController.getDonacionById);

// Rutas protegidas
router.post('/', authenticateToken, donacionesController.createDonacion);
router.get('/mis-donaciones', authenticateToken, donacionesController.getMisDonaciones);

// Rutas admin
router.get('/estadisticas/:causaId', authenticateToken, isAdmin, donacionesController.getEstadisticasDonaciones);

module.exports = router;
