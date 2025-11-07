/**
 * Sistema de Autenticación para Nexos
 * Maneja registro, login, sesión y perfiles de usuarios y empresas
 */

// Clase para gestionar la autenticación
class AuthSystem {
    constructor() {
        this.initializeStorage();
        this.createAdminAccounts();
    }

    // Inicializar estructura de datos en localStorage
    initializeStorage() {
        if (!localStorage.getItem('nexos_users')) {
            localStorage.setItem('nexos_users', JSON.stringify([]));
        }
        if (!localStorage.getItem('nexos_empresas')) {
            localStorage.setItem('nexos_empresas', JSON.stringify([]));
        }
        if (!localStorage.getItem('nexos_empresas_pendientes')) {
            localStorage.setItem('nexos_empresas_pendientes', JSON.stringify([]));
        }
        if (!localStorage.getItem('nexos_empresas_rechazadas')) {
            localStorage.setItem('nexos_empresas_rechazadas', JSON.stringify([]));
        }
        if (!localStorage.getItem('nexos_subastas')) {
            localStorage.setItem('nexos_subastas', JSON.stringify([]));
        }
        if (!localStorage.getItem('nexos_session')) {
            localStorage.setItem('nexos_session', JSON.stringify(null));
        }
        if (!localStorage.getItem('nexos_password_reset_requests')) {
            localStorage.setItem('nexos_password_reset_requests', JSON.stringify([]));
        }
    }

    // Crear cuentas admin y de prueba por defecto
    createAdminAccounts() {
        const users = this.getUsers();
        const empresas = this.getEmpresas();

        // Usuario admin
        if (!users.find(u => u.username === 'admin')) {
            users.push({
                id: this.generateId(),
                username: 'admin',
                password: '1234',
                email: 'admin@nexos.com',
                nombre: 'Administrador',
                apellido: 'Sistema',
                rut: '11.111.111-1',
                telefono: '',
                role: 'admin',
                saldo: 1000000,
                transacciones: [],
                configuraciones: this.getDefaultUserConfig(),
                fechaRegistro: new Date().toISOString()
            });
            localStorage.setItem('nexos_users', JSON.stringify(users));
        }

        // Usuario genérico de prueba
        if (!users.find(u => u.username === 'usuario1')) {
            users.push({
                id: this.generateId(),
                username: 'usuario1',
                password: '1234',
                email: 'usuario1@nexos.com',
                nombre: 'Usuario',
                apellido: 'Prueba',
                rut: '12.345.678-9',
                telefono: '123456789',
                role: 'user',
                saldo: 500000,
                transacciones: [],
                configuraciones: this.getDefaultUserConfig(),
                fechaRegistro: new Date().toISOString()
            });
            localStorage.setItem('nexos_users', JSON.stringify(users));
        }

        // Inicializar saldo y RUT en usuarios existentes
        let cambios = false;
        users.forEach(function(user) {
            if (user.saldo === undefined) {
                // Asignar saldo inicial según el usuario
                if (user.username === 'admin') {
                    user.saldo = 1000000;
                } else if (user.username === 'usuario1') {
                    user.saldo = 500000;
                } else {
                    user.saldo = 0;
                }
                user.transacciones = [];
                cambios = true;
            }
            // Inicializar RUT si no existe
            if (!user.rut) {
                if (user.username === 'admin') {
                    user.rut = '11.111.111-1';
                } else if (user.username === 'usuario1') {
                    user.rut = '12.345.678-9';
                } else {
                    user.rut = '00.000.000-0'; // RUT por defecto para usuarios antiguos
                }
                cambios = true;
            }
        });
        if (cambios) {
            localStorage.setItem('nexos_users', JSON.stringify(users));
        }

        // Empresa admin
        if (!empresas.find(e => e.username === 'admin')) {
            empresas.push({
                id: this.generateId(),
                username: 'admin',
                password: '1234',
                email: 'admin.empresa@nexos.com',
                razonSocial: 'Nexos Administración',
                rut: '12345678-9',
                telefono: '',
                direccion: '',
                sitioWeb: '',
                role: 'admin',
                estado: 'aprobada',
                saldo: 0,
                ingresos: [],
                retiros: [],
                configuraciones: this.getDefaultEmpresaConfig(),
                fechaRegistro: new Date().toISOString()
            });
            localStorage.setItem('nexos_empresas', JSON.stringify(empresas));
        }

        // Empresa genérica de prueba
        if (!empresas.find(e => e.username === 'empresa1')) {
            empresas.push({
                id: this.generateId(),
                username: 'empresa1',
                password: '1234',
                email: 'empresa1@nexos.com',
                razonSocial: 'Organización Genérica',
                rut: '98765432-1',
                telefono: '987654321',
                direccion: 'Calle Principal 123',
                sitioWeb: 'www.empresa1.com',
                role: 'empresa',
                estado: 'aprobada',
                saldo: 0,
                ingresos: [],
                retiros: [],
                configuraciones: this.getDefaultEmpresaConfig(),
                fechaRegistro: new Date().toISOString()
            });
            localStorage.setItem('nexos_empresas', JSON.stringify(empresas));
        }

        // Inicializar saldo en empresas existentes
        let cambiosEmpresas = false;
        empresas.forEach(function(empresa) {
            if (empresa.saldo === undefined) {
                empresa.saldo = 0;
                empresa.ingresos = [];
                empresa.retiros = [];
                cambiosEmpresas = true;
            }
        });
        if (cambiosEmpresas) {
            localStorage.setItem('nexos_empresas', JSON.stringify(empresas));
        }
    }

    // Generar ID único
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Obtener configuraciones por defecto para usuario
    getDefaultUserConfig() {
        return {
            tema: 'light',
            idioma: 'es',
            notificaciones: true,
            emailNotificaciones: true,
            accesibilidad: {
                altoContraste: false,
                tamañoTexto: 'normal', // small, normal, large
                lectorPantalla: false,
                animacionesReducidas: false
            }
        };
    }

    // Obtener configuraciones por defecto para empresa
    getDefaultEmpresaConfig() {
        return {
            tema: 'light',
            idioma: 'es',
            notificaciones: true,
            emailNotificaciones: true,
            visibilidadPerfil: 'publico', // publico, privado
            recibirSolicitudes: true
        };
    }

    // Obtener usuarios
    getUsers() {
        return JSON.parse(localStorage.getItem('nexos_users') || '[]');
    }

    // Obtener empresas
    getEmpresas() {
        return JSON.parse(localStorage.getItem('nexos_empresas') || '[]');
    }

    // Registrar usuario
    registerUser(userData) {
        const users = this.getUsers();
        
        // IMPORTANTE: Prevenir la creación de múltiples admins
        // Solo puede haber un administrador en el sistema
        if (userData.role === 'admin') {
            const existeAdmin = users.find(function(u) { return u.role === 'admin'; });
            if (existeAdmin) {
                return { success: false, message: 'Ya existe un administrador en el sistema. Solo puede haber uno.' };
            }
        }
        
        // Validar que no exista el username
        if (users.find(u => u.username === userData.username)) {
            return { success: false, message: 'El nombre de usuario ya existe' };
        }

        // Validar que no exista el email
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'El correo electrónico ya está registrado' };
        }

        // Validar que el RUT sea obligatorio
        if (!userData.rut || userData.rut.trim() === '') {
            return { success: false, message: 'El RUT es obligatorio' };
        }

        // Validar que no exista el RUT
        if (users.find(u => u.rut === userData.rut)) {
            return { success: false, message: 'El RUT ya está registrado' };
        }

        // Crear nuevo usuario
        const newUser = {
            id: this.generateId(),
            username: userData.username,
            password: userData.password,
            email: userData.email,
            nombre: userData.nombre,
            apellido: userData.apellido,
            rut: userData.rut,
            telefono: userData.telefono || '',
            role: userData.role || 'user', // Por defecto es 'user', nunca 'admin'
            configuraciones: this.getDefaultUserConfig(),
            fechaRegistro: new Date().toISOString()
        };

        // Forzar que los usuarios normales nunca sean admin
        if (newUser.role !== 'admin' || !users.find(function(u) { return u.role === 'admin'; })) {
            if (newUser.role === 'admin' && users.length > 0) {
                newUser.role = 'user'; // Convertir a user si intenta ser admin
            }
        }

        users.push(newUser);
        localStorage.setItem('nexos_users', JSON.stringify(users));

        return { success: true, message: 'Usuario registrado exitosamente', user: newUser };
    }

    // Registrar empresa (queda pendiente de aprobación)
    registerEmpresa(empresaData) {
        const empresas = this.getEmpresas();
        const pendientes = this.getEmpresasPendientes();
        const rechazadas = this.getEmpresasRechazadas();
        
        // Validar en todas las listas
        const allEmpresas = [...empresas, ...pendientes, ...rechazadas];
        
        // Validar que no exista el username
        if (allEmpresas.find(e => e.username === empresaData.username)) {
            return { success: false, message: 'El nombre de usuario ya existe' };
        }

        // Validar que no exista el email
        if (allEmpresas.find(e => e.email === empresaData.email)) {
            return { success: false, message: 'El correo electrónico ya está registrado' };
        }

        // Validar que no exista el RUT
        if (allEmpresas.find(e => e.rut === empresaData.rut)) {
            return { success: false, message: 'El RUT ya está registrado' };
        }

        // Crear nueva empresa pendiente de aprobación
        const newEmpresa = {
            id: this.generateId(),
            username: empresaData.username,
            password: empresaData.password,
            email: empresaData.email,
            razonSocial: empresaData.razonSocial,
            rut: empresaData.rut,
            telefono: empresaData.telefono || '',
            direccion: empresaData.direccion || '',
            sitioWeb: empresaData.sitioWeb || '',
            role: 'empresa',
            estado: 'pendiente',
            configuraciones: this.getDefaultEmpresaConfig(),
            fechaRegistro: new Date().toISOString()
        };

        pendientes.push(newEmpresa);
        localStorage.setItem('nexos_empresas_pendientes', JSON.stringify(pendientes));

        return { success: true, message: 'Solicitud de empresa enviada. Pendiente de aprobación por el administrador.', empresa: newEmpresa };
    }

    // Login
    login(username, password, type = 'user') {
        let account = null;
        
        if (type === 'user') {
            const users = this.getUsers();
            account = users.find(u => u.username === username && u.password === password);
        } else if (type === 'empresa') {
            const empresas = this.getEmpresas();
            account = empresas.find(e => e.username === username && e.password === password);
            
            // Verificar si está aprobada o es admin
            if (account && account.role !== 'admin' && account.estado !== 'aprobada') {
                return { success: false, message: 'Cuenta pendiente de aprobación por el administrador' };
            }
        }

        if (!account) {
            return { success: false, message: 'Usuario o contraseña incorrectos' };
        }

        // Crear sesión
        const session = {
            id: account.id,
            username: account.username,
            type: type,
            role: account.role,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('nexos_session', JSON.stringify(session));

        return { success: true, message: 'Inicio de sesión exitoso', session: session, account: account };
    }

    // Logout
    logout() {
        localStorage.setItem('nexos_session', JSON.stringify(null));
        return { success: true, message: 'Sesión cerrada exitosamente' };
    }

    // Verificar si hay sesión activa
    isLoggedIn() {
        const session = this.getSession();
        return session !== null;
    }

    // Obtener sesión actual
    getSession() {
        return JSON.parse(localStorage.getItem('nexos_session') || 'null');
    }

    // Obtener datos del usuario/empresa actual
    getCurrentAccount() {
        const session = this.getSession();
        if (!session) return null;

        if (session.type === 'user') {
            const users = this.getUsers();
            return users.find(u => u.id === session.id);
        } else if (session.type === 'empresa') {
            const empresas = this.getEmpresas();
            return empresas.find(e => e.id === session.id);
        }

        return null;
    }

    // Actualizar datos de usuario
    updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        
        if (index === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        // No permitir cambiar username, id, role
        delete updates.username;
        delete updates.id;
        delete updates.role;

        users[index] = { ...users[index], ...updates };
        localStorage.setItem('nexos_users', JSON.stringify(users));

        return { success: true, message: 'Usuario actualizado exitosamente', user: users[index] };
    }

    // Actualizar datos de empresa
    updateEmpresa(empresaId, updates) {
        const empresas = this.getEmpresas();
        const index = empresas.findIndex(e => e.id === empresaId);
        
        if (index === -1) {
            return { success: false, message: 'Empresa no encontrada' };
        }

        // No permitir cambiar username, id, role
        delete updates.username;
        delete updates.id;
        delete updates.role;

        empresas[index] = { ...empresas[index], ...updates };
        localStorage.setItem('nexos_empresas', JSON.stringify(empresas));

        return { success: true, message: 'Empresa actualizada exitosamente', empresa: empresas[index] };
    }

    // Actualizar configuraciones
    updateConfig(configUpdates) {
        const session = this.getSession();
        if (!session) return { success: false, message: 'No hay sesión activa' };

        const account = this.getCurrentAccount();
        if (!account) return { success: false, message: 'Cuenta no encontrada' };

        account.configuraciones = { ...account.configuraciones, ...configUpdates };

        if (session.type === 'user') {
            return this.updateUser(session.id, { configuraciones: account.configuraciones });
        } else {
            return this.updateEmpresa(session.id, { configuraciones: account.configuraciones });
        }
    }

    // Cambiar contraseña
    changePassword(currentPassword, newPassword) {
        const session = this.getSession();
        if (!session) return { success: false, message: 'No hay sesión activa' };

        const account = this.getCurrentAccount();
        if (!account) return { success: false, message: 'Cuenta no encontrada' };

        if (account.password !== currentPassword) {
            return { success: false, message: 'Contraseña actual incorrecta' };
        }

        if (session.type === 'user') {
            return this.updateUser(session.id, { password: newPassword });
        } else {
            return this.updateEmpresa(session.id, { password: newPassword });
        }
    }

    // Actualizar sesión con datos actualizados de la cuenta
    updateSession(updatedAccount) {
        const session = this.getSession();
        if (!session) return { success: false, message: 'No hay sesión activa' };

        // Actualizar el localStorage con los datos actualizados
        if (session.type === 'user') {
            const users = this.getUsers();
            const index = users.findIndex(u => u.id === updatedAccount.id);
            if (index !== -1) {
                users[index] = updatedAccount;
                localStorage.setItem('nexos_users', JSON.stringify(users));
            }
        } else if (session.type === 'empresa') {
            const empresas = this.getEmpresas();
            const index = empresas.findIndex(e => e.id === updatedAccount.id);
            if (index !== -1) {
                empresas[index] = updatedAccount;
                localStorage.setItem('nexos_empresas', JSON.stringify(empresas));
            }
        }

        // Actualizar la sesión para reflejar cambios como username
        session.username = updatedAccount.username;
        localStorage.setItem('nexos_session', JSON.stringify(session));

        return { success: true, message: 'Sesión actualizada' };
    }

    // Obtener empresas pendientes
    getEmpresasPendientes() {
        return JSON.parse(localStorage.getItem('nexos_empresas_pendientes') || '[]');
    }

    // Obtener empresas rechazadas
    getEmpresasRechazadas() {
        return JSON.parse(localStorage.getItem('nexos_empresas_rechazadas') || '[]');
    }

    // Aprobar empresa (solo admin)
    aprobarEmpresa(empresaId) {
        const session = this.getSession();
        if (!session || session.role !== 'admin') {
            return { success: false, message: 'No tienes permisos para realizar esta acción' };
        }

        const pendientes = this.getEmpresasPendientes();
        const empresaIndex = pendientes.findIndex(function(e) { return e.id === empresaId; });
        
        if (empresaIndex === -1) {
            return { success: false, message: 'Empresa no encontrada' };
        }

        const empresa = pendientes[empresaIndex];
        empresa.estado = 'aprobada';
        empresa.fechaAprobacion = new Date().toISOString();

        // Mover a empresas aprobadas
        const empresas = this.getEmpresas();
        empresas.push(empresa);
        localStorage.setItem('nexos_empresas', JSON.stringify(empresas));

        // Eliminar de pendientes
        pendientes.splice(empresaIndex, 1);
        localStorage.setItem('nexos_empresas_pendientes', JSON.stringify(pendientes));

        return { success: true, message: 'Empresa aprobada exitosamente' };
    }

    // Rechazar empresa (solo admin)
    rechazarEmpresa(empresaId, motivo) {
        const session = this.getSession();
        if (!session || session.role !== 'admin') {
            return { success: false, message: 'No tienes permisos para realizar esta acción' };
        }

        const pendientes = this.getEmpresasPendientes();
        const empresaIndex = pendientes.findIndex(function(e) { return e.id === empresaId; });
        
        if (empresaIndex === -1) {
            return { success: false, message: 'Empresa no encontrada' };
        }

        const empresa = pendientes[empresaIndex];
        empresa.estado = 'rechazada';
        empresa.motivoRechazo = motivo || '';
        empresa.fechaRechazo = new Date().toISOString();

        // Mover a rechazadas
        const rechazadas = this.getEmpresasRechazadas();
        rechazadas.push(empresa);
        localStorage.setItem('nexos_empresas_rechazadas', JSON.stringify(rechazadas));

        // Eliminar de pendientes
        pendientes.splice(empresaIndex, 1);
        localStorage.setItem('nexos_empresas_pendientes', JSON.stringify(pendientes));

        return { success: true, message: 'Empresa rechazada' };
    }

    // Crear subasta/rifa/producto (solo empresas aprobadas)
    crearSubasta(subastaData) {
        const session = this.getSession();
        if (!session || session.type !== 'empresa') {
            return { success: false, message: 'Solo las empresas pueden crear subastas' };
        }

        const empresa = this.getCurrentAccount();
        if (empresa.role !== 'admin' && empresa.estado !== 'aprobada') {
            return { success: false, message: 'Tu cuenta debe estar aprobada para crear subastas' };
        }

        const subastas = JSON.parse(localStorage.getItem('nexos_subastas') || '[]');

        const nuevaSubasta = {
            id: this.generateId(),
            empresaId: empresa.id,
            empresaNombre: empresa.razonSocial,
            tipo: subastaData.tipo,
            titulo: subastaData.titulo,
            descripcion: subastaData.descripcion,
            imagen: subastaData.imagen || '',
            precioInicial: subastaData.precioInicial || 0,
            precioActual: subastaData.precioInicial || 0,
            fechaInicio: subastaData.fechaInicio || new Date().toISOString(),
            fechaFin: subastaData.fechaFin,
            estado: 'activa',
            participantes: [],
            pujas: [],
            fechaCreacion: new Date().toISOString()
        };

        subastas.push(nuevaSubasta);
        localStorage.setItem('nexos_subastas', JSON.stringify(subastas));

        return { success: true, message: 'Subasta creada exitosamente', subasta: nuevaSubasta };
    }

    // Obtener subastas
    getSubastas(filtros) {
        let subastas = JSON.parse(localStorage.getItem('nexos_subastas') || '[]');
        filtros = filtros || {};

        if (filtros.empresaId) {
            subastas = subastas.filter(function(s) { return s.empresaId === filtros.empresaId; });
        }

        if (filtros.tipo) {
            subastas = subastas.filter(function(s) { return s.tipo === filtros.tipo; });
        }

        if (filtros.estado) {
            subastas = subastas.filter(function(s) { return s.estado === filtros.estado; });
        }

        return subastas;
    }

    // Actualizar estados de subastas según fecha
    actualizarEstadosSubastas() {
        const subastas = JSON.parse(localStorage.getItem('nexos_subastas') || '[]');
        const ahora = new Date();
        let cambios = false;

        subastas.forEach(function(subasta) {
            const fechaFin = new Date(subasta.fechaFin);
            
            // Si la subasta está activa y ya pasó la fecha de fin
            if (subasta.estado === 'activa' && ahora >= fechaFin) {
                subasta.estado = 'finalizada';
                
                // Determinar ganador (la puja más alta)
                if (subasta.pujas && subasta.pujas.length > 0) {
                    const pujaMaxima = subasta.pujas.reduce(function(max, puja) {
                        return puja.monto > max.monto ? puja : max;
                    }, subasta.pujas[0]);
                    
                    subasta.ganador = {
                        nombre: pujaMaxima.usuario,
                        monto: pujaMaxima.monto,
                        fecha: pujaMaxima.fecha
                    };
                    subasta.precioFinal = pujaMaxima.monto;
                } else {
                    subasta.ganador = null;
                    subasta.precioFinal = subasta.precioInicial;
                }
                
                cambios = true;
            }
        });

        if (cambios) {
            localStorage.setItem('nexos_subastas', JSON.stringify(subastas));
        }

        return cambios;
    }

    // Eliminar subasta
    eliminarSubasta(subastaId) {
        const session = this.getSession();
        if (!session) {
            return { success: false, message: 'Debes iniciar sesión' };
        }

        const subastas = JSON.parse(localStorage.getItem('nexos_subastas') || '[]');
        const subasta = subastas.find(function(s) { return s.id === subastaId; });

        if (!subasta) {
            return { success: false, message: 'Subasta no encontrada' };
        }

        // Verificar permisos
        if (session.role !== 'admin' && subasta.empresaId !== session.id) {
            return { success: false, message: 'No tienes permisos para eliminar esta subasta' };
        }

        const index = subastas.findIndex(function(s) { return s.id === subastaId; });
        subastas.splice(index, 1);
        localStorage.setItem('nexos_subastas', JSON.stringify(subastas));

        return { success: true, message: 'Subasta eliminada' };
    }

    // Eliminar usuario (solo admin)
    eliminarUsuario(userId) {
        const session = this.getSession();
        if (!session || session.role !== 'admin') {
            return { success: false, message: 'No tienes permisos para eliminar usuarios' };
        }

        const users = this.getUsers();
        const user = users.find(function(u) { return u.id === userId; });

        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        // No permitir eliminar admin
        if (user.role === 'admin') {
            return { success: false, message: 'No se puede eliminar al administrador' };
        }

        // Eliminar usuario
        const filteredUsers = users.filter(function(u) { return u.id !== userId; });
        localStorage.setItem('nexos_users', JSON.stringify(filteredUsers));

        // Si el usuario eliminado está en sesión activa, cerrar sesión
        if (session.id === userId) {
            this.logout();
        }

        return { success: true, message: 'Usuario eliminado correctamente' };
    }

    // Eliminar empresa (solo admin)
    eliminarEmpresa(empresaId) {
        const session = this.getSession();
        if (!session || session.role !== 'admin') {
            return { success: false, message: 'No tienes permisos para eliminar empresas' };
        }

        const empresas = this.getEmpresas();
        const empresa = empresas.find(function(e) { return e.id === empresaId; });

        if (!empresa) {
            return { success: false, message: 'Empresa no encontrada' };
        }

        // No permitir eliminar admin
        if (empresa.role === 'admin') {
            return { success: false, message: 'No se puede eliminar al administrador' };
        }

        // Eliminar empresa
        const filteredEmpresas = empresas.filter(function(e) { return e.id !== empresaId; });
        localStorage.setItem('nexos_empresas', JSON.stringify(filteredEmpresas));

        // Eliminar también las subastas de esta empresa
        const subastas = JSON.parse(localStorage.getItem('nexos_subastas') || '[]');
        const filteredSubastas = subastas.filter(function(s) { return s.empresaId !== empresaId; });
        localStorage.setItem('nexos_subastas', JSON.stringify(filteredSubastas));

        // Si la empresa eliminada está en sesión activa, cerrar sesión
        if (session.id === empresaId) {
            this.logout();
        }

        return { success: true, message: 'Empresa eliminada correctamente' };
    }

    // Cambiar contraseña de usuario (solo admin)
    cambiarPasswordUsuario(userId, newPassword) {
        const session = this.getSession();
        if (!session || session.role !== 'admin') {
            return { success: false, message: 'No tienes permisos para cambiar contraseñas' };
        }

        if (!newPassword || newPassword.length < 4) {
            return { success: false, message: 'La contraseña debe tener al menos 4 caracteres' };
        }

        const users = this.getUsers();
        const user = users.find(function(u) { return u.id === userId; });

        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        user.password = newPassword;
        localStorage.setItem('nexos_users', JSON.stringify(users));

        return { success: true, message: 'Contraseña actualizada correctamente' };
    }

    // Cambiar contraseña de empresa (solo admin)
    cambiarPasswordEmpresa(empresaId, newPassword) {
        const session = this.getSession();
        if (!session || session.role !== 'admin') {
            return { success: false, message: 'No tienes permisos para cambiar contraseñas' };
        }

        if (!newPassword || newPassword.length < 4) {
            return { success: false, message: 'La contraseña debe tener al menos 4 caracteres' };
        }

        const empresas = this.getEmpresas();
        const empresa = empresas.find(function(e) { return e.id === empresaId; });

        if (!empresa) {
            return { success: false, message: 'Empresa no encontrada' };
        }

        empresa.password = newPassword;
        localStorage.setItem('nexos_empresas', JSON.stringify(empresas));

        return { success: true, message: 'Contraseña actualizada correctamente' };
    }

    // Métodos de gestión de wallet
    getSaldo(accountId, type) {
        if (type === 'user') {
            const users = this.getUsers();
            console.log('[DEBUG getSaldo] Buscando usuario con ID:', accountId);
            console.log('[DEBUG getSaldo] Usuarios en localStorage:', users.map(function(u) { return { id: u.id, username: u.username, saldo: u.saldo }; }));
            const user = users.find(function(u) { return u.id === accountId; });
            console.log('[DEBUG getSaldo] Usuario encontrado:', user ? { username: user.username, saldo: user.saldo } : 'NO ENCONTRADO');
            return user ? (user.saldo || 0) : 0;
        } else if (type === 'empresa') {
            const empresas = this.getEmpresas();
            const empresa = empresas.find(function(e) { return e.id === accountId; });
            return empresa ? (empresa.saldo || 0) : 0;
        }
        return 0;
    }

    modificarSaldo(accountId, monto, motivo, type) {
        const session = this.getSession();
        if (!session || session.role !== 'admin') {
            return { success: false, message: 'No tienes permisos para modificar saldos' };
        }

        if (type === 'user') {
            const users = this.getUsers();
            const user = users.find(function(u) { return u.id === accountId; });
            
            if (!user) {
                return { success: false, message: 'Usuario no encontrado' };
            }

            if (!user.saldo) user.saldo = 0;
            if (!user.transacciones) user.transacciones = [];

            user.saldo += monto;
            
            user.transacciones.push({
                id: Date.now(),
                fecha: new Date().toISOString(),
                tipo: monto > 0 ? 'ingreso' : 'egreso',
                monto: Math.abs(monto),
                descripcion: motivo,
                saldoAnterior: user.saldo - monto,
                saldoNuevo: user.saldo
            });

            localStorage.setItem('nexos_users', JSON.stringify(users));
            return { success: true, message: 'Saldo modificado correctamente', nuevoSaldo: user.saldo };

        } else if (type === 'empresa') {
            const empresas = this.getEmpresas();
            const empresa = empresas.find(function(e) { return e.id === accountId; });
            
            if (!empresa) {
                return { success: false, message: 'Empresa no encontrada' };
            }

            if (!empresa.saldo) empresa.saldo = 0;
            if (!empresa.ingresos) empresa.ingresos = [];
            if (!empresa.retiros) empresa.retiros = [];

            empresa.saldo += monto;
            
            if (monto > 0) {
                empresa.ingresos.push({
                    id: Date.now(),
                    fecha: new Date().toISOString(),
                    monto: monto,
                    descripcion: motivo,
                    saldoNuevo: empresa.saldo
                });
            } else {
                empresa.retiros.push({
                    id: Date.now(),
                    fecha: new Date().toISOString(),
                    monto: Math.abs(monto),
                    descripcion: motivo,
                    saldoNuevo: empresa.saldo
                });
            }

            localStorage.setItem('nexos_empresas', JSON.stringify(empresas));
            return { success: true, message: 'Saldo modificado correctamente', nuevoSaldo: empresa.saldo };
        }

        return { success: false, message: 'Tipo de cuenta inválido' };
    }

    registrarTransaccion(accountId, tipo, monto, descripcion, type) {
        if (type === 'user') {
            const users = this.getUsers();
            const user = users.find(function(u) { return u.id === accountId; });
            
            if (!user) {
                return { success: false, message: 'Usuario no encontrado' };
            }

            if (!user.saldo) user.saldo = 0;
            if (!user.transacciones) user.transacciones = [];

            const saldoAnterior = user.saldo;
            
            if (tipo === 'egreso') {
                if (user.saldo < monto) {
                    return { success: false, message: 'Saldo insuficiente' };
                }
                user.saldo -= monto;
            } else if (tipo === 'ingreso') {
                user.saldo += monto;
            }

            user.transacciones.push({
                id: Date.now(),
                fecha: new Date().toISOString(),
                tipo: tipo,
                monto: monto,
                descripcion: descripcion,
                saldoAnterior: saldoAnterior,
                saldoNuevo: user.saldo
            });

            localStorage.setItem('nexos_users', JSON.stringify(users));
            return { success: true, message: 'Transacción registrada', nuevoSaldo: user.saldo };

        } else if (type === 'empresa') {
            const empresas = this.getEmpresas();
            const empresa = empresas.find(function(e) { return e.id === accountId; });
            
            if (!empresa) {
                return { success: false, message: 'Empresa no encontrada' };
            }

            if (!empresa.saldo) empresa.saldo = 0;
            if (!empresa.ingresos) empresa.ingresos = [];
            if (!empresa.retiros) empresa.retiros = [];

            if (tipo === 'egreso' || tipo === 'retiro') {
                if (empresa.saldo < monto) {
                    return { success: false, message: 'Saldo insuficiente' };
                }
                empresa.saldo -= monto;
                empresa.retiros.push({
                    id: Date.now(),
                    fecha: new Date().toISOString(),
                    monto: monto,
                    descripcion: descripcion,
                    saldoNuevo: empresa.saldo
                });
            } else if (tipo === 'ingreso') {
                empresa.saldo += monto;
                empresa.ingresos.push({
                    id: Date.now(),
                    fecha: new Date().toISOString(),
                    monto: monto,
                    descripcion: descripcion,
                    saldoNuevo: empresa.saldo
                });
            }

            localStorage.setItem('nexos_empresas', JSON.stringify(empresas));
            return { success: true, message: 'Transacción registrada', nuevoSaldo: empresa.saldo };
        }

        return { success: false, message: 'Tipo de cuenta inválido' };
    }

    getTransacciones(accountId, type) {
        if (type === 'user') {
            const users = this.getUsers();
            const user = users.find(function(u) { return u.id === accountId; });
            return user && user.transacciones ? user.transacciones : [];
        } else if (type === 'empresa') {
            const empresas = this.getEmpresas();
            const empresa = empresas.find(function(e) { return e.id === accountId; });
            return {
                ingresos: empresa && empresa.ingresos ? empresa.ingresos : [],
                retiros: empresa && empresa.retiros ? empresa.retiros : []
            };
        }
        return [];
    }

    // ===== GESTIÓN DE RESTABLECIMIENTO DE CONTRASEÑAS =====

    // Obtener solicitudes de restablecimiento
    getPasswordResetRequests() {
        return JSON.parse(localStorage.getItem('nexos_password_reset_requests') || '[]');
    }

    // Solicitar restablecimiento por email
    requestPasswordReset(email) {
        if (!email) return { success: false, message: 'Debe proporcionar un correo electrónico' };
        
        const users = this.getUsers();
        const empresas = this.getEmpresas();
        const requests = this.getPasswordResetRequests();

        // Buscar en usuarios
        let account = users.find(u => u.email === email);
        let tipo = 'user';
        
        if (!account) {
            account = empresas.find(e => e.email === email);
            tipo = 'empresa';
        }

        if (!account) {
            return { success: false, message: 'No se encontró una cuenta con ese correo electrónico' };
        }

        const req = {
            id: this.generateId(),
            accountId: account.id,
            username: account.username,
            email: account.email,
            displayName: tipo === 'user' ? `${account.nombre} ${account.apellido}` : account.razonSocial,
            type: tipo,
            status: tipo === 'empresa' ? 'pendiente' : 'aprobada',
            createdAt: new Date().toISOString(),
            tempPassword: null,
            motivoRechazo: null,
            adminId: null,
            adminDecisionAt: null
        };

        // Si es usuario, generar contraseña temporal y aplicar de inmediato
        if (tipo === 'user') {
            const temp = Math.random().toString(36).slice(-8);
            const idx = users.findIndex(u => u.id === account.id);
            if (idx !== -1) {
                users[idx].password = temp;
                localStorage.setItem('nexos_users', JSON.stringify(users));
                req.tempPassword = temp;
                req.adminDecisionAt = new Date().toISOString();
            }
        }

        requests.push(req);
        localStorage.setItem('nexos_password_reset_requests', JSON.stringify(requests));

        const message = tipo === 'empresa'
            ? 'Solicitud enviada. El administrador debe aprobarla o rechazarla.'
            : 'Solicitud procesada. Tu contraseña temporal es: ' + (req.tempPassword || 'N/A');

        return { success: true, message: message, request: req };
    }

    // Aprobar solicitud de restablecimiento (solo admin)
    approvePasswordReset(requestId, newPassword) {
        const session = this.getSession();
        if (!session || session.role !== 'admin') {
            return { success: false, message: 'No tienes permisos para realizar esta acción' };
        }

        const requests = this.getPasswordResetRequests();
        const idx = requests.findIndex(r => r.id === requestId);
        if (idx === -1) return { success: false, message: 'Solicitud no encontrada' };

        const req = requests[idx];

        if (!newPassword || newPassword.length < 4) {
            return { success: false, message: 'La contraseña debe tener al menos 4 caracteres' };
        }

        // Actualizar contraseña según tipo
        if (req.type === 'empresa') {
            const empresas = this.getEmpresas();
            const eidx = empresas.findIndex(e => e.id === req.accountId);
            if (eidx === -1) return { success: false, message: 'Empresa no encontrada' };
            empresas[eidx].password = newPassword;
            localStorage.setItem('nexos_empresas', JSON.stringify(empresas));
        } else {
            const users = this.getUsers();
            const uidx = users.findIndex(u => u.id === req.accountId);
            if (uidx === -1) return { success: false, message: 'Usuario no encontrado' };
            users[uidx].password = newPassword;
            localStorage.setItem('nexos_users', JSON.stringify(users));
        }

        req.status = 'aprobada';
        req.tempPassword = newPassword;
        req.adminId = session.id;
        req.adminDecisionAt = new Date().toISOString();

        requests[idx] = req;
        localStorage.setItem('nexos_password_reset_requests', JSON.stringify(requests));

        return { success: true, message: 'Solicitud aprobada y contraseña actualizada correctamente' };
    }

    // Rechazar solicitud de restablecimiento (solo admin)
    rejectPasswordReset(requestId, motivo) {
        const session = this.getSession();
        if (!session || session.role !== 'admin') {
            return { success: false, message: 'No tienes permisos para realizar esta acción' };
        }

        const requests = this.getPasswordResetRequests();
        const idx = requests.findIndex(r => r.id === requestId);
        if (idx === -1) return { success: false, message: 'Solicitud no encontrada' };

        const req = requests[idx];
        req.status = 'rechazada';
        req.motivoRechazo = motivo || 'Sin motivo especificado';
        req.adminId = session.id;
        req.adminDecisionAt = new Date().toISOString();

        requests[idx] = req;
        localStorage.setItem('nexos_password_reset_requests', JSON.stringify(requests));

        return { success: true, message: 'Solicitud rechazada correctamente' };
    }

    // Actualizar foto de perfil
    updateProfilePhoto(photoBase64, accountType = 'user') {
        const session = this.getSession();
        if (!session) {
            return { success: false, message: 'No hay sesión activa' };
        }

        // Validar que sea una imagen base64 válida
        if (!photoBase64 || !photoBase64.startsWith('data:image/')) {
            return { success: false, message: 'Formato de imagen inválido' };
        }

        if (accountType === 'empresa' || session.type === 'empresa') {
            const empresas = this.getEmpresas();
            const idx = empresas.findIndex(e => e.id === session.id);
            if (idx === -1) return { success: false, message: 'Empresa no encontrada' };
            
            empresas[idx].profilePhoto = photoBase64;
            localStorage.setItem('nexos_empresas', JSON.stringify(empresas));
            
            // Actualizar sesión
            session.profilePhoto = photoBase64;
            localStorage.setItem('nexos_session', JSON.stringify(session));
            
            return { success: true, message: 'Foto de perfil actualizada correctamente' };
        } else {
            const users = this.getUsers();
            const idx = users.findIndex(u => u.id === session.id);
            if (idx === -1) return { success: false, message: 'Usuario no encontrado' };
            
            users[idx].profilePhoto = photoBase64;
            localStorage.setItem('nexos_users', JSON.stringify(users));
            
            // Actualizar sesión
            session.profilePhoto = photoBase64;
            localStorage.setItem('nexos_session', JSON.stringify(session));
            
            return { success: true, message: 'Foto de perfil actualizada correctamente' };
        }
    }

    // Obtener foto de perfil del usuario actual
    getProfilePhoto() {
        const session = this.getSession();
        if (!session) return null;
        
        return session.profilePhoto || null;
    }

    // Eliminar foto de perfil
    removeProfilePhoto(accountType = 'user') {
        const session = this.getSession();
        if (!session) {
            return { success: false, message: 'No hay sesión activa' };
        }

        if (accountType === 'empresa' || session.type === 'empresa') {
            const empresas = this.getEmpresas();
            const idx = empresas.findIndex(e => e.id === session.id);
            if (idx === -1) return { success: false, message: 'Empresa no encontrada' };
            
            delete empresas[idx].profilePhoto;
            localStorage.setItem('nexos_empresas', JSON.stringify(empresas));
            
            // Actualizar sesión
            delete session.profilePhoto;
            localStorage.setItem('nexos_session', JSON.stringify(session));
            
            return { success: true, message: 'Foto de perfil eliminada correctamente' };
        } else {
            const users = this.getUsers();
            const idx = users.findIndex(u => u.id === session.id);
            if (idx === -1) return { success: false, message: 'Usuario no encontrado' };
            
            delete users[idx].profilePhoto;
            localStorage.setItem('nexos_users', JSON.stringify(users));
            
            // Actualizar sesión
            delete session.profilePhoto;
            localStorage.setItem('nexos_session', JSON.stringify(session));
            
            return { success: true, message: 'Foto de perfil eliminada correctamente' };
        }
    }
}

// Crear instancia global
const auth = new AuthSystem();

// Función para actualizar la interfaz del navbar
function updateNavbar() {
    const session = auth.getSession();
    const ctaButton = document.querySelector('.cta-button');
    
    if (!ctaButton) return;

    if (session) {
        const account = auth.getCurrentAccount();
        if (!account) return;

        const displayName = session.type === 'user' 
            ? account.username 
            : account.nombreEmpresa || account.razonSocial;

        // Reemplazar botón de login con menú de usuario
        ctaButton.style.display = 'none';
        
        let userMenu = document.getElementById('user-menu');
        if (!userMenu) {
            userMenu = document.createElement('div');
            userMenu.id = 'user-menu';
            userMenu.className = 'user-menu';
            const adminLink = session.role === 'admin' ? '<a href="admin.html"><i class="fas fa-user-shield"></i> Panel Admin</a>' : '';
            const dbViewerLink = session.role === 'admin' ? '<a href="db-viewer.html"><i class="fas fa-database"></i> DB Viewer</a>' : '';
            
            // Solo mostrar wallet si NO es usuario admin (pero sí para empresa admin)
            let walletHTML = '';
            let walletLinkDropdown = '';
            if (!(session.type === 'user' && session.role === 'admin')) {
                const saldo = auth.getSaldo(session.id, session.type);
                const saldoFormateado = new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0
                }).format(saldo);
                const financeHash = session.type === 'user' ? 'perfil.html#finanzas' : 'perfil-empresa.html#finanzas';
                
                walletHTML = '<a href="' + financeHash + '" class="wallet-link" title="Ver mi wallet">' +
                    '<i class="fas fa-wallet"></i>' +
                    '<span class="wallet-amount">' + saldoFormateado + '</span>' +
                    '</a>';
                
                walletLinkDropdown = '<a href="' + financeHash + '">' +
                    '<i class="fas fa-wallet"></i> Mi Wallet</a>';
            }
            
            // Botón crear subasta solo para empresas
            let crearSubastaHTML = '';
            if (session.type === 'empresa') {
                crearSubastaHTML = '<a href="perfil-empresa.html#subastas" class="crear-subasta-link" title="Crear Nueva Subasta">' +
                    '<i class="fas fa-plus-circle"></i>' +
                    '<span>Crear Subasta</span>' +
                    '</a>';
            }

            // Botón Panel Admin visible en navbar
            let adminButtonHTML = '';
            if (session.role === 'admin') {
                adminButtonHTML = '<a href="admin.html" class="admin-panel-link" title="Panel de Administración">' +
                    '<i class="fas fa-user-shield"></i>' +
                    '<span>Admin</span>' +
                    '</a>';
            }
            
            // Icono de usuario: foto de perfil o ícono por defecto
            let userIcon = '<i class="fas fa-user-circle"></i>';
            if (session.profilePhoto) {
                userIcon = '<img src="' + session.profilePhoto + '" alt="Perfil" class="user-menu-photo">';
            }
            
            userMenu.innerHTML = walletHTML + crearSubastaHTML + adminButtonHTML +
                '<button class="user-menu-button" onclick="toggleUserMenu()">' +
                userIcon +
                '<span>' + displayName + '</span>' +
                '<i class="fas fa-chevron-down"></i>' +
                '</button>' +
                '<div class="user-dropdown" id="user-dropdown" style="display: none;">' +
                '<a href="' + (session.role === 'admin' || session.type === 'user' || session.type === 'usuario' ? 'perfil.html' : 'perfil-empresa.html') + '">' +
                '<i class="fas fa-user"></i> Mi Perfil</a>' +
                walletLinkDropdown +
                adminLink +
                dbViewerLink +
                '<a href="' + (session.role === 'admin' || session.type === 'user' || session.type === 'usuario' ? 'perfil.html#configuracion' : 'perfil-empresa.html#configuracion') + '">' +
                '<i class="fas fa-cog"></i> Configuración</a>' +
                '<a href="#" onclick="logoutUser(); return false;">' +
                '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>' +
                '</div>';
            ctaButton.parentNode.insertBefore(userMenu, ctaButton.nextSibling);
        } else {
            // Actualizar saldo si el menú ya existe (solo si no es usuario admin)
            if (!(session.type === 'user' && session.role === 'admin')) {
                const walletAmount = userMenu.querySelector('.wallet-amount');
                if (walletAmount) {
                    const saldo = auth.getSaldo(session.id, session.type);
                    const saldoFormateado = new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0
                    }).format(saldo);
                    walletAmount.textContent = saldoFormateado;
                }
            }
        }
    } else {
        ctaButton.style.display = 'block';
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            userMenu.remove();
        }
    }
}

// Toggle del menú de usuario
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

// Cerrar menú al hacer clic fuera
document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('user-menu');
    const dropdown = document.getElementById('user-dropdown');
    
    if (userMenu && dropdown && !userMenu.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

// Función de logout
async function logoutUser() {
    const confirmed = await confirm('¿Estás seguro de que deseas cerrar sesión?');
    if (confirmed) {
        auth.logout();
        window.location.href = 'index.html';
    }
}

// Actualizar navbar cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
    updateNavbar();
});

// Exportar para uso global
window.auth = auth;
window.updateNavbar = updateNavbar;
window.toggleUserMenu = toggleUserMenu;
window.logoutUser = logoutUser;
