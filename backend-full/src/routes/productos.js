const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const { authenticateToken, isEmpresa } = require('../middleware/auth');

// Rutas públicas
router.get('/', productosController.getProductos);
router.get('/:id', productosController.getProductoById);

// Rutas protegidas - solo empresas
router.post('/', authenticateToken, isEmpresa, productosController.createProducto);
router.put('/:id', authenticateToken, isEmpresa, productosController.updateProducto);
router.delete('/:id', authenticateToken, isEmpresa, productosController.deleteProducto);

module.exports = router;
