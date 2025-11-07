const { User, Puja, Subasta, Transaccion, BoletoRifa, Rifa } = require('../models');
const bcrypt = require('bcryptjs');

/**
 * Obtener perfil del usuario actual
 */
exports.getPerfil = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ 
            success: true,
            user 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar perfil del usuario
 */
exports.updatePerfil = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { nombre, apellido, telefono, direccion, rut } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualizar campos
        if (nombre) user.nombre = nombre;
        if (apellido) user.apellido = apellido;
        if (telefono) user.telefono = telefono;
        if (direccion) user.direccion = direccion;
        if (rut) user.rut = rut;

        await user.save();

        // Devolver usuario sin password
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json({
            success: true,
            message: 'Perfil actualizado correctamente',
            user: userResponse
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cambiar contraseña del usuario
 */
exports.cambiarPassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { passwordAntigua, passwordNueva } = req.body;

        if (!passwordAntigua || !passwordNueva) {
            return res.status(400).json({ 
                message: 'Debe proporcionar la contraseña antigua y la nueva' 
            });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar contraseña antigua
        const isValidPassword = await bcrypt.compare(passwordAntigua, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Contraseña antigua incorrecta' });
        }

        // Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(passwordNueva, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Contraseña actualizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener historial de pujas del usuario
 */
exports.getHistorialPujas = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const pujas = await Puja.findAll({
            where: { usuarioId: userId },
            include: [
                {
                    model: Subasta,
                    as: 'subasta',
                    attributes: ['id', 'titulo', 'estado', 'imagenes']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json({
            success: true,
            pujas
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener historial de compras (transacciones)
 */
exports.getHistorialCompras = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const compras = await Transaccion.findAll({
            where: { 
                usuarioId: userId,
                tipo: 'compra',
                estado: 'completada'
            },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json({
            success: true,
            compras
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener participación en rifas
 */
exports.getParticipacionRifas = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const boletos = await BoletoRifa.findAll({
            where: { usuarioId: userId },
            include: [
                {
                    model: Rifa,
                    as: 'rifa',
                    attributes: ['id', 'titulo', 'estado', 'fechaSorteo', 'imagen']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Agrupar boletos por rifa
        const participaciones = {};
        boletos.forEach(boleto => {
            const rifaId = boleto.rifaId;
            if (!participaciones[rifaId]) {
                participaciones[rifaId] = {
                    rifa: boleto.rifa,
                    boletos: [],
                    createdAt: boleto.createdAt
                };
            }
            participaciones[rifaId].boletos.push({
                id: boleto.id,
                numero: boleto.numero,
                estado: boleto.estado
            });
        });

        const rifas = Object.values(participaciones);

        res.json({
            success: true,
            rifas
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar cuenta de usuario
 */
exports.eliminarCuenta = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ 
                message: 'Debe proporcionar su contraseña para confirmar' 
            });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // No eliminar físicamente, solo desactivar
        user.activo = false;
        await user.save();

        res.json({
            success: true,
            message: 'Cuenta desactivada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports;
