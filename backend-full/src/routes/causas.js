const express = require('express');
const router = express.Router();
const causasController = require('../controllers/causasController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Rutas públicas
router.get('/', causasController.getCausas);
router.get('/:id', causasController.getCausaById);

// Rutas protegidas - solo admin
router.post('/', authenticateToken, isAdmin, causasController.createCausa);
router.put('/:id', authenticateToken, isAdmin, causasController.updateCausa);
router.delete('/:id', authenticateToken, isAdmin, causasController.deleteCausa);

module.exports = router;
