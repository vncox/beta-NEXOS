const express = require('express');
const router = express.Router();
const rifasController = require('../controllers/rifasController');
const { authenticateToken, isEmpresa, isAdmin } = require('../middleware/auth');

// Rutas públicas
router.get('/', rifasController.getRifas);
router.get('/:id', rifasController.getRifaById);

// Rutas protegidas - requieren autenticación
router.post('/', authenticateToken, isEmpresa, rifasController.createRifa);
router.put('/:id', authenticateToken, isEmpresa, rifasController.updateRifa);
router.delete('/:id', authenticateToken, isEmpresa, rifasController.deleteRifa);
router.post('/:id/publicar', authenticateToken, isEmpresa, rifasController.publicarRifa);
router.post('/:id/comprar', authenticateToken, rifasController.comprarBoletos);
router.post('/:id/finalizar', authenticateToken, isEmpresa, rifasController.finalizarRifa);

// Rutas de usuario
router.get('/mis-boletos', authenticateToken, rifasController.getMisBoletos);

module.exports = router;
