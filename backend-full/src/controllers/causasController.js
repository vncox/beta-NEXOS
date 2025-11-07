const { Causa } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtener todas las causas
 */
exports.getCausas = async (req, res, next) => {
    try {
        const {
            estado,
            categoria,
            limit = 20,
            offset = 0
        } = req.query;

        const where = {};

        if (estado) where.estado = estado;
        if (categoria) where.categoria = categoria;

        const causas = await Causa.findAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            causas,
            total: await Causa.count({ where })
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener causa por ID
 */
exports.getCausaById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const causa = await Causa.findByPk(id);

        if (!causa) {
            return res.status(404).json({ success: false, error: 'Causa no encontrada' });
        }

        res.json({ success: true, causa });
    } catch (error) {
        next(error);
    }
};

/**
 * Crear causa (solo admin)
 */
exports.createCausa = async (req, res, next) => {
    try {
        const {
            nombre,
            descripcion,
            categoria,
            imagen,
            metaRecaudacion,
            recaudacionActual,
            organizacion,
            contacto
        } = req.body;

        const causa = await Causa.create({
            nombre,
            descripcion,
            categoria,
            imagen,
            metaRecaudacion: metaRecaudacion ? parseFloat(metaRecaudacion) : null,
            recaudacionActual: recaudacionActual ? parseFloat(recaudacionActual) : 0,
            organizacion,
            contacto,
            estado: 'activa'
        });

        res.status(201).json({
            message: 'Causa creada exitosamente',
            causa
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar causa (solo admin)
 */
exports.updateCausa = async (req, res, next) => {
    try {
        const { id } = req.params;

        const causa = await Causa.findByPk(id);

        if (!causa) {
            return res.status(404).json({ error: 'Causa no encontrada' });
        }

        const {
            nombre,
            descripcion,
            categoria,
            imagen,
            metaRecaudacion,
            recaudacionActual,
            organizacion,
            contacto,
            estado
        } = req.body;

        await causa.update({
            nombre: nombre || causa.nombre,
            descripcion: descripcion || causa.descripcion,
            categoria: categoria || causa.categoria,
            imagen: imagen || causa.imagen,
            metaRecaudacion: metaRecaudacion !== undefined ? parseFloat(metaRecaudacion) : causa.metaRecaudacion,
            recaudacionActual: recaudacionActual !== undefined ? parseFloat(recaudacionActual) : causa.recaudacionActual,
            organizacion: organizacion || causa.organizacion,
            contacto: contacto || causa.contacto,
            estado: estado || causa.estado
        });

        res.json({
            message: 'Causa actualizada exitosamente',
            causa
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar causa (solo admin)
 */
exports.deleteCausa = async (req, res, next) => {
    try {
        const { id } = req.params;

        const causa = await Causa.findByPk(id);

        if (!causa) {
            return res.status(404).json({ error: 'Causa no encontrada' });
        }

        await causa.destroy();

        res.json({ message: 'Causa eliminada exitosamente' });
    } catch (error) {
        next(error);
    }
};
