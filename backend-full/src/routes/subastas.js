const express = require('express');
const router = express.Router();
const subastasController = require('../controllers/subastasController');
const pujasController = require('../controllers/pujasController');
const { authenticateToken, isEmpresa, isUser } = require('../middleware/auth');
const { uuidValidation, paginationValidation, validate } = require('../middleware/validate');
const { body } = require('express-validator');

// ============================================
// RUTAS DE SUBASTAS
// ============================================

// Públicas
router.get('/', paginationValidation, validate, subastasController.listSubastas);
router.get('/:id', uuidValidation, validate, subastasController.getSubasta);

// Protegidas - Solo Empresas
router.post('/',
    authenticateToken,
    isEmpresa,
    [
        body('titulo').trim().notEmpty().withMessage('Título es requerido'),
        body('descripcion').trim().notEmpty().withMessage('Descripción es requerida'),
        body('precio_inicial').isFloat({ min: 0 }).withMessage('Precio inicial inválido'),
        body('fecha_inicio').isISO8601().withMessage('Fecha de inicio inválida'),
        body('fecha_fin').isISO8601().withMessage('Fecha de fin inválida'),
        validate
    ],
    subastasController.createSubasta
);

router.put('/:id',
    authenticateToken,
    isEmpresa,
    uuidValidation,
    validate,
    subastasController.updateSubasta
);

router.post('/:id/cancel',
    authenticateToken,
    isEmpresa,
    uuidValidation,
    validate,
    subastasController.cancelSubasta
);

router.post('/:id/finalizar',
    authenticateToken,
    isEmpresa,
    uuidValidation,
    validate,
    subastasController.finalizarSubasta
);

// ============================================
// RUTAS DE PUJAS
// ============================================

// Obtener pujas de una subasta
router.get('/:subasta_id/pujas',
    uuidValidation,
    validate,
    pujasController.getPujasSubasta
);

// Crear puja (solo usuarios)
router.post('/:subasta_id/pujas',
    authenticateToken,
    isUser,
    [
        body('monto').isFloat({ min: 0 }).withMessage('Monto inválido'),
        validate
    ],
    pujasController.crearPuja
);

// Mis pujas
router.get('/user/pujas',
    authenticateToken,
    isUser,
    paginationValidation,
    validate,
    pujasController.getMisPujas
);

module.exports = router;
