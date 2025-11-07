/**
 * Sistema de Autenticación para Nexos - Conectado al Backend
 * Maneja registro, login, sesión y perfiles conectado a la API REST
 */

class AuthSystemBackend {
    constructor() {
        this.currentUser = null;
        this.loadSession();
    }

    /**
     * Carga la sesión desde localStorage
     */
    loadSession() {
        const token = localStorage.getItem('nexos_token');
        const userStr = localStorage.getItem('nexos_user');
        
        if (token && userStr) {
            try {
                this.currentUser = JSON.parse(userStr);
                // Verificar token en segundo plano
                this.verifyTokenAsync();
            } catch (error) {
                console.error('Error cargando sesión:', error);
                this.clearSession();
            }
        }
    }

    /**
     * Verifica el token de forma asíncrona
     */
    async verifyTokenAsync() {
        try {
            await apiClient.verifyToken();
        } catch (error) {
            // Solo limpiar sesión si es un error de autenticación (401)
            if (error.message && error.message.includes('Token')) {
                console.warn('Token inválido, limpiando sesión');
                this.clearSession();
                // Solo redirigir si estamos en página protegida
                if (window.location.pathname.includes('perfil') || 
                    window.location.pathname.includes('admin')) {
                    window.location.href = 'login.html';
                }
            }
            // Si es error de red u otro, mantener la sesión
        }
    }

    /**
     * Guarda la sesión
     */
    saveSession(token, user) {
        localStorage.setItem('nexos_token', token);
        localStorage.setItem('nexos_user', JSON.stringify(user));
        
        // También guardar en formato de auth.js para compatibilidad con navbar
        const session = {
            id: user.id,
            username: user.username,
            type: user.role === 'admin' ? 'user' : (user.razon_social ? 'empresa' : 'user'),
            role: user.role || 'user',
            email: user.email,
            avatar: user.avatar || user.logo || null,
            profilePhoto: user.avatar || user.logo || null
        };
        localStorage.setItem('nexos_session', JSON.stringify(session));
        
        this.currentUser = user;
    }

    /**
     * Limpia la sesión
     */
    clearSession() {
        localStorage.removeItem('nexos_token');
        localStorage.removeItem('nexos_user');
        localStorage.removeItem('nexos_session');
        this.currentUser = null;
    }

    /**
     * Login de usuario
     */
    async login(username, password) {
        try {
            const response = await apiClient.login(username, password);
            this.saveSession(response.token, response.account);
            return {
                success: true,
                message: 'Login exitoso',
                data: response
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error al iniciar sesión'
            };
        }
    }

    /**
     * Registro de usuario
     */
    async registerUser(userData) {
        try {
            const response = await apiClient.registerUser(userData);
            return {
                success: true,
                message: 'Usuario registrado exitosamente',
                data: response
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error al registrar usuario'
            };
        }
    }

    /**
     * Registro de empresa
     */
    async registerEmpresa(empresaData) {
        try {
            const response = await apiClient.registerEmpresa(empresaData);
            return {
                success: true,
                message: 'Empresa registrada exitosamente. Pendiente de aprobación por administrador.',
                data: response
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error al registrar empresa'
            };
        }
    }

    /**
     * Cierra sesión
     */
    logout() {
        this.clearSession();
        window.location.href = 'login.html';
    }

    /**
     * Verifica si hay una sesión activa
     */
    isLoggedIn() {
        return this.currentUser !== null && localStorage.getItem('nexos_token') !== null;
    }

    /**
     * Obtiene el usuario actual
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Verifica si el usuario es admin
     */
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    /**
     * Verifica si es una empresa
     */
    isEmpresa() {
        return this.currentUser && this.currentUser.role === 'empresa';
    }

    /**
     * Verifica si es un usuario regular
     */
    isUsuario() {
        return this.currentUser && this.currentUser.role === 'user';
    }

    /**
     * Obtiene el perfil actualizado del servidor
     */
    async refreshProfile() {
        try {
            const response = await apiClient.getProfile();
            this.currentUser = response.account;
            localStorage.setItem('nexos_user', JSON.stringify(response.account));
            return {
                success: true,
                data: response.account
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Actualiza el perfil
     */
    async updateProfile(profileData) {
        try {
            const response = await apiClient.updateProfile(profileData);
            this.currentUser = response.account;
            localStorage.setItem('nexos_user', JSON.stringify(response.account));
            return {
                success: true,
                message: 'Perfil actualizado exitosamente',
                data: response.account
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error al actualizar perfil'
            };
        }
    }

    /**
     * Cambia la contraseña
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await apiClient.changePassword(currentPassword, newPassword);
            return {
                success: true,
                message: 'Contraseña cambiada exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error al cambiar contraseña'
            };
        }
    }

    /**
     * Solicita recuperación de contraseña
     */
    async requestPasswordReset(email, tipoCuenta) {
        try {
            await apiClient.requestPasswordReset(email, tipoCuenta);
            return {
                success: true,
                message: 'Se ha enviado un enlace de recuperación a tu correo'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error al solicitar recuperación'
            };
        }
    }

    /**
     * Restablece la contraseña con token
     */
    async resetPassword(token, newPassword) {
        try {
            await apiClient.resetPassword(token, newPassword);
            return {
                success: true,
                message: 'Contraseña restablecida exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error al restablecer contraseña'
            };
        }
    }

    /**
     * Redirige a la página apropiada según el rol
     */
    redirectToDashboard() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        if (this.isAdmin()) {
            window.location.href = 'admin.html';
        } else if (this.isEmpresa()) {
            window.location.href = 'perfil-empresa.html';
        } else {
            window.location.href = 'perfil.html';
        }
    }

    /**
     * Protege una página (requiere estar logueado)
     */
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    /**
     * Requiere rol de admin
     */
    requireAdmin() {
        if (!this.requireAuth()) return false;
        
        if (!this.isAdmin()) {
            alert('Acceso denegado. Solo administradores.');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    /**
     * Requiere rol de empresa
     */
    requireEmpresa() {
        if (!this.requireAuth()) return false;
        
        if (!this.isEmpresa() && !this.isAdmin()) {
            alert('Acceso denegado. Solo empresas.');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    /**
     * Actualiza la UI con información del usuario
     */
    updateUIWithUserInfo() {
        if (!this.isLoggedIn()) return;

        const user = this.currentUser;
        
        // Actualizar nombre en la interfaz
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = user.nombre || user.razon_social || user.username;
        });

        // Actualizar email
        const userEmailElements = document.querySelectorAll('.user-email');
        userEmailElements.forEach(el => {
            el.textContent = user.email;
        });

        // Actualizar saldo
        const saldoElements = document.querySelectorAll('.user-saldo');
        saldoElements.forEach(el => {
            el.textContent = `$${parseFloat(user.saldo || 0).toLocaleString('es-CL')}`;
        });

        // Actualizar avatar
        const avatarElements = document.querySelectorAll('.user-avatar');
        avatarElements.forEach(el => {
            if (user.avatar) {
                el.src = user.avatar;
            }
        });

        // Mostrar/ocultar elementos según rol
        if (this.isAdmin()) {
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
        }
        if (this.isEmpresa()) {
            document.querySelectorAll('.empresa-only').forEach(el => el.style.display = '');
        }
    }
}

// Instancia global del sistema de autenticación
const authBackend = new AuthSystemBackend();

// Alias para compatibilidad
const auth = authBackend;
