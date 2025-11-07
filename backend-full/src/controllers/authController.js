const jwt = require('jsonwebtoken');
const { User, Empresa, Transaccion } = require('../models');
const { Op } = require('sequelize');

// Generar JWT Token
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// Registro de Usuario
exports.registerUser = async (req, res) => {
    try {
        const { username, password, email, nombre, apellido, rut, telefono, direccion } = req.body;

        // Validar que no exista usuario con mismo username, email o rut
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email },
                    { rut }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'Usuario ya existe con ese username, email o RUT'
            });
        }

        // Crear usuario (el hook beforeCreate hasheará la contraseña)
        const user = await User.create({
            username,
            password,
            email,
            nombre,
            apellido,
            rut,
            telefono,
            direccion,
            saldo: 0,
            role: 'user'
        });

        // Generar token
        const token = generateToken({
            id: user.id,
            username: user.username,
            role: user.role,
            tipo: 'usuario'
        });

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: user.toSafeObject()
        });
    } catch (error) {
        console.error('Error en registerUser:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

// Registro de Empresa
exports.registerEmpresa = async (req, res) => {
    try {
        const {
            username,
            password,
            email,
            razon_social,
            rut,
            giro,
            telefono,
            direccion,
            sitio_web,
            descripcion
        } = req.body;

        // Validar que no exista empresa con mismo username, email o rut
        const existingEmpresa = await Empresa.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email },
                    { rut }
                ]
            }
        });

        if (existingEmpresa) {
            return res.status(400).json({
                error: 'Empresa ya existe con ese username, email o RUT'
            });
        }

        // Crear empresa (estado inicial: pendiente)
        const empresa = await Empresa.create({
            username,
            password,
            email,
            razon_social,
            rut,
            giro,
            telefono,
            direccion,
            sitio_web,
            descripcion,
            saldo: 0,
            estado: 'pendiente',
            role: 'empresa'
        });

        res.status(201).json({
            message: 'Empresa registrada exitosamente. Esperando aprobación del administrador.',
            empresa: empresa.toSafeObject()
        });
    } catch (error) {
        console.error('Error en registerEmpresa:', error);
        res.status(500).json({ error: 'Error al registrar empresa' });
    }
};

// Login (Usuario o Empresa)
exports.login = async (req, res) => {
    try {
        const { username, password, tipo } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username y password son requeridos' });
        }

        let account = null;
        let accountType = tipo || 'usuario'; // Por defecto buscar usuario

        // Buscar en usuarios si tipo es 'usuario' o no está especificado
        if (accountType === 'usuario') {
            account = await User.findOne({ where: { username } });
            if (account) {
                accountType = 'usuario';
            }
        }

        // Si no se encontró como usuario, buscar como empresa
        if (!account && (accountType === 'empresa' || !tipo)) {
            account = await Empresa.findOne({ where: { username } });
            if (account) {
                accountType = 'empresa';
                
                // Verificar estado de la empresa
                if (account.estado === 'pendiente') {
                    return res.status(403).json({
                        error: 'Tu cuenta está pendiente de aprobación por un administrador'
                    });
                }
                if (account.estado === 'rechazada') {
                    return res.status(403).json({
                        error: `Tu cuenta fue rechazada. Motivo: ${account.motivo_rechazo || 'No especificado'}`
                    });
                }
                if (account.estado === 'suspendida') {
                    return res.status(403).json({
                        error: 'Tu cuenta está suspendida. Contacta al administrador.'
                    });
                }
            }
        }

        if (!account) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const isValidPassword = await account.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar token
        const token = generateToken({
            id: account.id,
            username: account.username,
            role: account.role,
            tipo: accountType
        });

        res.json({
            message: 'Login exitoso',
            token,
            tipo: accountType,
            account: account.toSafeObject()
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};

// Verificar Token
exports.verifyToken = async (req, res) => {
    try {
        // El middleware de auth ya verificó el token y adjuntó req.user
        const { id, tipo } = req.user;

        let account = null;
        if (tipo === 'usuario') {
            account = await User.findByPk(id);
        } else {
            account = await Empresa.findByPk(id);
        }

        if (!account) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }

        res.json({
            valid: true,
            tipo,
            account: account.toSafeObject()
        });
    } catch (error) {
        console.error('Error en verifyToken:', error);
        res.status(500).json({ error: 'Error al verificar token' });
    }
};

// Cambiar contraseña
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const { id, tipo } = req.user;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Se requieren ambas contraseñas' });
        }

        let account = null;
        if (tipo === 'usuario') {
            account = await User.findByPk(id);
        } else {
            account = await Empresa.findByPk(id);
        }

        if (!account) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }

        // Verificar contraseña actual
        const isValid = await account.comparePassword(currentPassword);
        if (!isValid) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }

        // Actualizar contraseña (el hook beforeUpdate la hasheará)
        account.password = newPassword;
        await account.save();

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error en changePassword:', error);
        res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
};

// Obtener perfil
exports.getProfile = async (req, res) => {
    try {
        const { id, tipo } = req.user;

        let account = null;
        if (tipo === 'usuario') {
            account = await User.findByPk(id, {
                include: [
                    { association: 'transacciones', limit: 10, order: [['created_at', 'DESC']] }
                ]
            });
        } else {
            account = await Empresa.findByPk(id, {
                include: [
                    { association: 'transacciones', limit: 10, order: [['created_at', 'DESC']] },
                    { association: 'subastas', limit: 5 },
                    { association: 'rifas', limit: 5 },
                    { association: 'productos', limit: 5 }
                ]
            });
        }

        if (!account) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }

        res.json(account.toSafeObject());
    } catch (error) {
        console.error('Error en getProfile:', error);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
};

// Actualizar perfil
exports.updateProfile = async (req, res) => {
    try {
        const { id, tipo } = req.user;
        const updates = req.body;

        // Campos que no se pueden actualizar directamente
        delete updates.id;
        delete updates.username;
        delete updates.password;
        delete updates.saldo;
        delete updates.role;
        if (tipo === 'empresa') {
            delete updates.estado;
            delete updates.fecha_aprobacion;
            delete updates.aprobada_por;
        }

        let account = null;
        if (tipo === 'usuario') {
            account = await User.findByPk(id);
        } else {
            account = await Empresa.findByPk(id);
        }

        if (!account) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }

        await account.update(updates);

        res.json({
            message: 'Perfil actualizado exitosamente',
            account: account.toSafeObject()
        });
    } catch (error) {
        console.error('Error en updateProfile:', error);
        res.status(500).json({ error: 'Error al actualizar perfil' });
    }
};
