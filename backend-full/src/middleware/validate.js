const { validationResult } = require('express-validator');

// Middleware para procesar resultados de validación
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Errores de validación',
            details: errors.array()
        });
    }
    next();
};

// Validaciones comunes
const { body, param, query } = require('express-validator');

exports.registerUserValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username solo puede contener letras, números y guiones bajos'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password debe tener al menos 6 caracteres'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('Nombre es requerido'),
    body('apellido')
        .trim()
        .notEmpty()
        .withMessage('Apellido es requerido'),
    body('rut')
        .trim()
        .notEmpty()
        .withMessage('RUT es requerido')
];

exports.registerEmpresaValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username solo puede contener letras, números y guiones bajos'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password debe tener al menos 6 caracteres'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('razon_social')
        .trim()
        .notEmpty()
        .withMessage('Razón social es requerida'),
    body('rut')
        .trim()
        .notEmpty()
        .withMessage('RUT es requerido')
];

exports.loginValidation = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username es requerido'),
    body('password')
        .notEmpty()
        .withMessage('Password es requerido')
];

exports.uuidValidation = [
    param('id')
        .isUUID()
        .withMessage('ID debe ser un UUID válido')
];

exports.paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page debe ser un número mayor a 0'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit debe estar entre 1 y 100')
];
