const { Producto, Empresa } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtener todos los productos
 */
exports.getProductos = async (req, res, next) => {
    try {
        const {
            estado,
            empresaId,
            categoria,
            limit = 20,
            offset = 0
        } = req.query;

        const where = {};

        if (estado) where.estado = estado;
        if (empresaId) where.empresaId = empresaId;
        if (categoria) where.categoria = categoria;

        const productos = await Producto.findAll({
            where,
            include: [
                { model: Empresa, as: 'empresa', attributes: ['id', 'razon_social', 'logo'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            productos,
            total: await Producto.count({ where })
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener producto por ID
 */
exports.getProductoById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findByPk(id, {
            include: [{ model: Empresa, as: 'empresa' }]
        });

        if (!producto) {
            return res.status(404).json({ success: false, error: 'Producto no encontrado' });
        }

        res.json({ success: true, producto });
    } catch (error) {
        next(error);
    }
};

/**
 * Crear producto (solo empresas)
 */
exports.createProducto = async (req, res, next) => {
    try {
        const empresaId = req.user.id;
        const {
            nombre,
            descripcion,
            precio,
            stock,
            categoria,
            imagenes,
            especificaciones
        } = req.body;

        const producto = await Producto.create({
            empresaId,
            nombre,
            descripcion,
            precio: parseFloat(precio),
            stock: parseInt(stock),
            categoria,
            imagenes: imagenes || [],
            especificaciones: especificaciones || {},
            estado: 'disponible'
        });

        res.status(201).json({
            message: 'Producto creado exitosamente',
            producto
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar producto
 */
exports.updateProducto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const empresaId = req.user.id;

        const producto = await Producto.findByPk(id);

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        if (producto.empresaId !== empresaId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'No autorizado' });
        }

        const {
            nombre,
            descripcion,
            precio,
            stock,
            categoria,
            imagenes,
            especificaciones,
            estado
        } = req.body;

        await producto.update({
            nombre: nombre || producto.nombre,
            descripcion: descripcion || producto.descripcion,
            precio: precio ? parseFloat(precio) : producto.precio,
            stock: stock !== undefined ? parseInt(stock) : producto.stock,
            categoria: categoria || producto.categoria,
            imagenes: imagenes || producto.imagenes,
            especificaciones: especificaciones || producto.especificaciones,
            estado: estado || producto.estado
        });

        res.json({
            message: 'Producto actualizado exitosamente',
            producto
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar producto
 */
exports.deleteProducto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const empresaId = req.user.id;

        const producto = await Producto.findByPk(id);

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        if (producto.empresaId !== empresaId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'No autorizado' });
        }

        await producto.destroy();

        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
};
