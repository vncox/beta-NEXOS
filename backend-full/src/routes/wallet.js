const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validate, uuidValidation } = require('../middleware/validate');

// Todas las rutas requieren autenticación

// Obtener saldo
router.get('/saldo', authenticateToken, walletController.getSaldo);

// Depositar fondos
router.post('/depositar',
    authenticateToken,
    [
        body('monto').isFloat({ min: 0.01 }).withMessage('Monto debe ser mayor a 0'),
        body('metodo_pago').optional().trim(),
        body('transaction_id').optional().trim(),
        validate
    ],
    walletController.depositar
);

// Retirar fondos
router.post('/retirar',
    authenticateToken,
    [
        body('monto').isFloat({ min: 0.01 }).withMessage('Monto debe ser mayor a 0'),
        body('metodo_retiro').trim().notEmpty().withMessage('Método de retiro es requerido'),
        body('datos_bancarios').notEmpty().withMessage('Datos bancarios son requeridos'),
        validate
    ],
    walletController.retirar
);

// Historial de transacciones
router.get('/transacciones',
    authenticateToken,
    walletController.getTransacciones
);

// Detalle de transacción
router.get('/transacciones/:transaccion_id',
    authenticateToken,
    uuidValidation,
    validate,
    walletController.getTransaccion
);

module.exports = router;
