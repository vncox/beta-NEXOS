/**
 * Configuración de API para Nexos
 * Maneja todas las peticiones al backend
 */

const API_CONFIG = {
    BASE_URL: 'http://localhost:4000/api',
    ENDPOINTS: {
        // Auth
        LOGIN: '/auth/login',
        REGISTER_USER: '/auth/register/user',
        REGISTER_EMPRESA: '/auth/register/empresa',
        VERIFY_TOKEN: '/auth/verify',
        GET_PROFILE: '/auth/profile',
        UPDATE_PROFILE: '/auth/profile',
        CHANGE_PASSWORD: '/auth/change-password',
        REQUEST_PASSWORD_RESET: '/auth/request-password-reset',
        RESET_PASSWORD: '/auth/reset-password',
        
        // Subastas
        SUBASTAS: '/subastas',
        SUBASTA_BY_ID: (id) => `/subastas/${id}`,
        CREATE_SUBASTA: '/subastas',
        UPDATE_SUBASTA: (id) => `/subastas/${id}`,
        DELETE_SUBASTA: (id) => `/subastas/${id}`,
        PUBLICAR_SUBASTA: (id) => `/subastas/${id}/publicar`,
        FINALIZAR_SUBASTA: (id) => `/subastas/${id}/finalizar`,
        
        // Pujas
        CREATE_PUJA: (subastaId) => `/subastas/${subastaId}/pujas`,
        PUJAS_BY_SUBASTA: (subastaId) => `/subastas/${subastaId}/pujas`,
        MY_PUJAS: '/subastas/user/pujas',
        
        // Wallet
        WALLET: '/wallet',
        WALLET_DEPOSIT: '/wallet/deposit',
        WALLET_WITHDRAW: '/wallet/withdraw',
        WALLET_TRANSACTIONS: '/wallet/transactions',
        
        // Admin
        ADMIN_ESTADISTICAS: '/admin/estadisticas',
        ADMIN_EMPRESAS: '/admin/empresas',
        ADMIN_APROBAR_EMPRESA: (id) => `/admin/empresas/${id}/aprobar`,
        ADMIN_RECHAZAR_EMPRESA: (id) => `/admin/empresas/${id}/rechazar`,
        ADMIN_TOGGLE_EMPRESA: (id) => `/admin/empresas/${id}/toggle-activo`,
        ADMIN_DELETE_EMPRESA: (id) => `/admin/empresas/${id}`,
        ADMIN_USUARIOS: '/admin/usuarios',
        ADMIN_TOGGLE_USUARIO: (id) => `/admin/usuarios/${id}/toggle-activo`,
        ADMIN_DELETE_USUARIO: (id) => `/admin/usuarios/${id}`,
        ADMIN_SUBASTAS: '/admin/subastas',
        ADMIN_REPORTE_TRANSACCIONES: '/admin/reportes/transacciones',
        ADMIN_REPORTE_DONACIONES: '/admin/reportes/donaciones',
        
        // Rifas
        RIFAS: '/rifas',
        RIFA_BY_ID: (id) => `/rifas/${id}`,
        
        // Productos
        PRODUCTOS: '/productos',
        PRODUCTO_BY_ID: (id) => `/productos/${id}`,
        
        // Causas
        CAUSAS: '/causas',
        CAUSA_BY_ID: (id) => `/causas/${id}`,
        
        // Donaciones
        DONACIONES: '/donaciones',
        DONACION_BY_ID: (id) => `/donaciones/${id}`,
        MIS_DONACIONES: '/donaciones/mis-donaciones',
        
        // Users
        USER_PERFIL: '/users/perfil',
        USER_UPDATE_PERFIL: '/users/perfil',
        USER_CHANGE_PASSWORD: '/users/password',
        USER_HISTORIAL_PUJAS: '/users/historial/pujas',
        USER_HISTORIAL_COMPRAS: '/users/historial/compras',
        USER_HISTORIAL_RIFAS: '/users/historial/rifas',
        USER_DELETE_CUENTA: '/users/cuenta'
    }
};

/**
 * Clase para manejar peticiones HTTP al backend
 */
class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }

    /**
     * Obtiene el token de autenticación
     */
    getToken() {
        return localStorage.getItem('nexos_token');
    }

    /**
     * Guarda el token de autenticación
     */
    setToken(token) {
        localStorage.setItem('nexos_token', token);
    }

    /**
     * Elimina el token de autenticación
     */
    clearToken() {
        localStorage.removeItem('nexos_token');
        localStorage.removeItem('nexos_user');
    }

    /**
     * Obtiene headers por defecto
     */
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    /**
     * Maneja errores de la API
     */
    async handleResponse(response) {
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token inválido o expirado
                this.clearToken();
                window.location.href = 'login.html';
            }
            throw new Error(data.message || data.error || 'Error en la petición');
        }

        return data;
    }

    /**
     * GET request
     */
    async get(endpoint, includeAuth = true) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders(includeAuth)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error en GET:', error);
            throw error;
        }
    }

    /**
     * POST request
     */
    async post(endpoint, data, includeAuth = true) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(includeAuth),
                body: JSON.stringify(data)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error en POST:', error);
            throw error;
        }
    }

    /**
     * PUT request
     */
    async put(endpoint, data, includeAuth = true) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(includeAuth),
                body: JSON.stringify(data)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error en PUT:', error);
            throw error;
        }
    }

    /**
     * DELETE request
     */
    async delete(endpoint, includeAuth = true) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders(includeAuth)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error en DELETE:', error);
            throw error;
        }
    }

    // ==================== AUTH ====================

    async login(username, password) {
        const data = await this.post(API_CONFIG.ENDPOINTS.LOGIN, { username, password }, false);
        this.setToken(data.token);
        localStorage.setItem('nexos_user', JSON.stringify(data.account));
        return data;
    }

    async registerUser(userData) {
        return await this.post(API_CONFIG.ENDPOINTS.REGISTER_USER, userData, false);
    }

    async registerEmpresa(empresaData) {
        return await this.post(API_CONFIG.ENDPOINTS.REGISTER_EMPRESA, empresaData, false);
    }

    async verifyToken() {
        return await this.get(API_CONFIG.ENDPOINTS.VERIFY_TOKEN);
    }

    async getProfile() {
        return await this.get(API_CONFIG.ENDPOINTS.GET_PROFILE);
    }

    async updateProfile(profileData) {
        return await this.put(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, profileData);
    }

    async changePassword(currentPassword, newPassword) {
        return await this.post(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
            currentPassword,
            newPassword
        });
    }

    async requestPasswordReset(email, tipoCuenta) {
        return await this.post(API_CONFIG.ENDPOINTS.REQUEST_PASSWORD_RESET, {
            email,
            tipoCuenta
        }, false);
    }

    async resetPassword(token, newPassword) {
        return await this.post(API_CONFIG.ENDPOINTS.RESET_PASSWORD, {
            token,
            newPassword
        }, false);
    }

    // ==================== SUBASTAS ====================

    async getSubastas(filtros = {}) {
        const params = new URLSearchParams(filtros);
        return await this.get(`${API_CONFIG.ENDPOINTS.SUBASTAS}?${params}`, false);
    }

    async getSubastaById(id) {
        return await this.get(API_CONFIG.ENDPOINTS.SUBASTA_BY_ID(id), false);
    }

    async createSubasta(subastaData) {
        return await this.post(API_CONFIG.ENDPOINTS.CREATE_SUBASTA, subastaData);
    }

    async updateSubasta(id, subastaData) {
        return await this.put(API_CONFIG.ENDPOINTS.UPDATE_SUBASTA(id), subastaData);
    }

    async deleteSubasta(id) {
        return await this.delete(API_CONFIG.ENDPOINTS.DELETE_SUBASTA(id));
    }

    async publicarSubasta(id) {
        return await this.post(API_CONFIG.ENDPOINTS.PUBLICAR_SUBASTA(id));
    }

    async finalizarSubasta(id) {
        return await this.post(API_CONFIG.ENDPOINTS.FINALIZAR_SUBASTA(id));
    }

    // ==================== PUJAS ====================

    async createPuja(subastaId, monto) {
        return await this.post(API_CONFIG.ENDPOINTS.CREATE_PUJA(subastaId), {
            monto
        });
    }

    async getPujasBySubasta(subastaId) {
        return await this.get(API_CONFIG.ENDPOINTS.PUJAS_BY_SUBASTA(subastaId), false);
    }

    async getMyPujas() {
        return await this.get(API_CONFIG.ENDPOINTS.MY_PUJAS);
    }

    // ==================== WALLET ====================

    async getWallet() {
        return await this.get(API_CONFIG.ENDPOINTS.WALLET);
    }

    async depositWallet(monto, metodoPago) {
        return await this.post(API_CONFIG.ENDPOINTS.WALLET_DEPOSIT, {
            monto,
            metodoPago
        });
    }

    async withdrawWallet(monto) {
        return await this.post(API_CONFIG.ENDPOINTS.WALLET_WITHDRAW, { monto });
    }

    async getWalletTransactions(limit = 10, offset = 0) {
        return await this.get(`${API_CONFIG.ENDPOINTS.WALLET_TRANSACTIONS}?limit=${limit}&offset=${offset}`);
    }

    // ==================== ADMIN ====================

    async getEstadisticas() {
        return await this.get(API_CONFIG.ENDPOINTS.ADMIN_ESTADISTICAS);
    }

    async getEmpresasAdmin(filtros = {}) {
        const params = new URLSearchParams(filtros);
        return await this.get(`${API_CONFIG.ENDPOINTS.ADMIN_EMPRESAS}?${params}`);
    }

    async aprobarEmpresa(id) {
        return await this.put(API_CONFIG.ENDPOINTS.ADMIN_APROBAR_EMPRESA(id));
    }

    async rechazarEmpresa(id, motivo) {
        return await this.put(API_CONFIG.ENDPOINTS.ADMIN_RECHAZAR_EMPRESA(id), { motivo });
    }

    async getUsuariosAdmin(filtros = {}) {
        const params = new URLSearchParams(filtros);
        return await this.get(`${API_CONFIG.ENDPOINTS.ADMIN_USUARIOS}?${params}`);
    }

    async toggleUsuarioActivo(id) {
        return await this.put(API_CONFIG.ENDPOINTS.ADMIN_TOGGLE_USUARIO(id));
    }

    async deleteUsuarioAdmin(id) {
        return await this.delete(API_CONFIG.ENDPOINTS.ADMIN_DELETE_USUARIO(id));
    }

    async toggleEmpresaActiva(id) {
        return await this.put(API_CONFIG.ENDPOINTS.ADMIN_TOGGLE_EMPRESA(id));
    }

    async deleteEmpresaAdmin(id) {
        return await this.delete(API_CONFIG.ENDPOINTS.ADMIN_DELETE_EMPRESA(id));
    }

    async getSubastasAdmin(filtros = {}) {
        const params = new URLSearchParams(filtros);
        return await this.get(`${API_CONFIG.ENDPOINTS.ADMIN_SUBASTAS}?${params}`);
    }

    async getReporteTransacciones(filtros = {}) {
        const params = new URLSearchParams(filtros);
        return await this.get(`${API_CONFIG.ENDPOINTS.ADMIN_REPORTE_TRANSACCIONES}?${params}`);
    }

    async getReporteDonaciones() {
        return await this.get(API_CONFIG.ENDPOINTS.ADMIN_REPORTE_DONACIONES);
    }

    async getActividadReciente(limite = 10) {
        return await this.get(`/admin/actividad-reciente?limite=${limite}`);
    }

    async getDashboardFinanciero() {
        return await this.get('/admin/dashboard-financiero');
    }

    // ==================== RIFAS ====================

    async getRifas(filtros = {}) {
        const params = new URLSearchParams(filtros);
        return await this.get(`${API_CONFIG.ENDPOINTS.RIFAS}?${params}`, false);
    }

    async getRifaById(id) {
        return await this.get(API_CONFIG.ENDPOINTS.RIFA_BY_ID(id), false);
    }

    // ==================== PRODUCTOS ====================

    async getProductos(filtros = {}) {
        const params = new URLSearchParams(filtros);
        return await this.get(`${API_CONFIG.ENDPOINTS.PRODUCTOS}?${params}`, false);
    }

    async getProductoById(id) {
        return await this.get(API_CONFIG.ENDPOINTS.PRODUCTO_BY_ID(id), false);
    }

    // ==================== CAUSAS ====================

    async getCausas(filtros = {}) {
        const params = new URLSearchParams(filtros);
        return await this.get(`${API_CONFIG.ENDPOINTS.CAUSAS}?${params}`, false);
    }

    async getCausaById(id) {
        return await this.get(API_CONFIG.ENDPOINTS.CAUSA_BY_ID(id), false);
    }

    // ==================== DONACIONES ====================

    async getDonaciones(filtros = {}) {
        const params = new URLSearchParams(filtros);
        return await this.get(`${API_CONFIG.ENDPOINTS.DONACIONES}?${params}`, false);
    }

    async createDonacion(causaId, monto, mensaje) {
        return await this.post(API_CONFIG.ENDPOINTS.DONACIONES, {
            causaId,
            monto,
            mensaje
        });
    }

    async getMisDonaciones() {
        return await this.get(API_CONFIG.ENDPOINTS.MIS_DONACIONES);
    }

    // ==================== USERS (PERFIL) ====================

    async getUserPerfil() {
        return await this.get(API_CONFIG.ENDPOINTS.USER_PERFIL);
    }

    async updateUserPerfil(datos) {
        return await this.put(API_CONFIG.ENDPOINTS.USER_UPDATE_PERFIL, datos);
    }

    async changeUserPassword(passwordAntigua, passwordNueva) {
        return await this.put(API_CONFIG.ENDPOINTS.USER_CHANGE_PASSWORD, {
            passwordAntigua,
            passwordNueva
        });
    }

    async getUserHistorialPujas() {
        return await this.get(API_CONFIG.ENDPOINTS.USER_HISTORIAL_PUJAS);
    }

    async getUserHistorialCompras() {
        return await this.get(API_CONFIG.ENDPOINTS.USER_HISTORIAL_COMPRAS);
    }

    async getUserHistorialRifas() {
        return await this.get(API_CONFIG.ENDPOINTS.USER_HISTORIAL_RIFAS);
    }

    async deleteUserCuenta(password) {
        return await this.delete(API_CONFIG.ENDPOINTS.USER_DELETE_CUENTA, { password });
    }
}

// Instancia global del cliente API
const apiClient = new APIClient();
