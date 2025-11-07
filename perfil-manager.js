// Manager para el perfil de usuario con backend
class PerfilManager {
    constructor() {
        this.apiClient = new APIClient();
        this.walletManager = new WalletManager();
    }

    // Cargar datos del perfil desde el backend
    async cargarPerfil() {
        try {
            const response = await this.apiClient.getUserPerfil();
            if (response.success && response.user) {
                this.renderPerfil(response.user);
                return { success: true, user: response.user };
            } else {
                console.error('Error al cargar perfil:', response.message);
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            return { success: false, message: error.message };
        }
    }

    // Renderizar datos del perfil en la UI
    renderPerfil(user) {
        // Avatar con inicial
        const avatar = document.querySelector('.profile-avatar');
        if (avatar && user.nombre) {
            const initial = user.nombre.charAt(0).toUpperCase();
            avatar.textContent = initial;
        }

        // Nombre completo
        const nombreElement = document.getElementById('profile-name');
        if (nombreElement) {
            nombreElement.textContent = user.nombre || user.username;
        }

        // Email
        const emailElement = document.getElementById('profile-email');
        if (emailElement) {
            emailElement.textContent = user.email || '';
        }

        // Username
        const usernameElement = document.getElementById('profile-username');
        if (usernameElement) {
            usernameElement.textContent = '@' + user.username;
        }

        // Saldo en la tarjeta de wallet
        const saldoElement = document.getElementById('saldo-actual');
        if (saldoElement && user.saldo !== undefined) {
            saldoElement.textContent = '$' + user.saldo.toLocaleString('es-CL');
        }

        // Llenar formulario de edición
        const formNombre = document.getElementById('edit-nombre');
        const formEmail = document.getElementById('edit-email');
        const formTelefono = document.getElementById('edit-telefono');

        if (formNombre) formNombre.value = user.nombre || '';
        if (formEmail) formEmail.value = user.email || '';
        if (formTelefono) formTelefono.value = user.telefono || '';

        // Estadísticas
        this.actualizarEstadisticas(user);
    }

    // Actualizar estadísticas del usuario
    actualizarEstadisticas(user) {
        const stats = {
            'pujas-participadas': user.pujasCount || 0,
            'subastas-ganadas': user.subastasGanadasCount || 0,
            'rifas-participadas': user.rifasCount || 0,
            'causas-apoyadas': user.donacionesCount || 0
        };

        for (const [id, value] of Object.entries(stats)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }
    }

    // Actualizar perfil
    async actualizarPerfil(datos) {
        try {
            const response = await this.apiClient.updateUserPerfil(datos);
            if (response.success) {
                // Recargar perfil
                await this.cargarPerfil();
                
                // Actualizar navbar si existe
                if (typeof auth !== 'undefined' && auth.updateUIWithUserInfo) {
                    auth.updateUIWithUserInfo();
                }

                return { success: true, message: 'Perfil actualizado correctamente' };
            } else {
                return { success: false, message: response.message || 'Error al actualizar perfil' };
            }
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            return { success: false, message: error.message };
        }
    }

    // Cambiar contraseña
    async cambiarPassword(passwordActual, passwordNuevo) {
        try {
            const response = await this.apiClient.changeUserPassword(passwordActual, passwordNuevo);
            if (response.success) {
                return { success: true, message: 'Contraseña actualizada correctamente' };
            } else {
                return { success: false, message: response.message || 'Error al cambiar contraseña' };
            }
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            return { success: false, message: error.message };
        }
    }

    // Cargar transacciones del wallet
    async cargarTransacciones() {
        try {
            const response = await this.walletManager.getTransacciones();
            if (response.success && response.transacciones) {
                this.renderTransacciones(response.transacciones);
                return { success: true };
            }
            return { success: false };
        } catch (error) {
            console.error('Error al cargar transacciones:', error);
            return { success: false };
        }
    }

    // Renderizar transacciones
    renderTransacciones(transacciones) {
        const container = document.getElementById('transacciones-lista');
        if (!container) return;

        if (!transacciones || transacciones.length === 0) {
            container.innerHTML = '<div class="empty-state">No hay transacciones recientes</div>';
            return;
        }

        container.innerHTML = transacciones.map(t => `
            <div class="transaction-item">
                <div class="transaction-icon ${t.tipo}">
                    <i class="fas fa-${t.tipo === 'deposito' ? 'arrow-down' : t.tipo === 'retiro' ? 'arrow-up' : 'exchange-alt'}"></i>
                </div>
                <div class="transaction-info">
                    <div class="transaction-title">${this.getTipoLabel(t.tipo)}</div>
                    <div class="transaction-date">${new Date(t.createdAt).toLocaleString('es-CL')}</div>
                    ${t.descripcion ? `<div class="transaction-desc">${t.descripcion}</div>` : ''}
                </div>
                <div class="transaction-amount ${t.tipo === 'deposito' ? 'positive' : 'negative'}">
                    ${t.tipo === 'deposito' ? '+' : '-'}$${Math.abs(t.monto).toLocaleString('es-CL')}
                </div>
            </div>
        `).join('');
    }

    getTipoLabel(tipo) {
        const labels = {
            'deposito': 'Depósito',
            'retiro': 'Retiro',
            'puja': 'Puja en subasta',
            'ganancia_subasta': 'Ganancia subasta',
            'reembolso_subasta': 'Reembolso subasta',
            'compra_boleto': 'Compra boleto rifa',
            'donacion': 'Donación a causa',
            'compra_producto': 'Compra de producto'
        };
        return labels[tipo] || tipo;
    }

    // Cargar actividad del usuario
    async cargarActividad() {
        // Por ahora mostrar actividad básica
        // En el futuro se puede crear un endpoint específico
        const container = document.getElementById('actividad-reciente-lista');
        if (!container) return;

        const actividades = [
            {
                tipo: 'login',
                descripcion: 'Inicio de sesión',
                fecha: new Date().toISOString()
            }
        ];

        this.renderActividad(actividades);
    }

    // Renderizar actividad
    renderActividad(actividades) {
        const container = document.getElementById('actividad-reciente-lista');
        if (!container) return;

        if (!actividades || actividades.length === 0) {
            container.innerHTML = '<div class="empty-state">No hay actividad reciente</div>';
            return;
        }

        container.innerHTML = actividades.map(a => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${this.getActivityIcon(a.tipo)}"></i>
                </div>
                <div class="activity-info">
                    <div class="activity-title">${a.descripcion}</div>
                    <div class="activity-date">${new Date(a.fecha).toLocaleString('es-CL')}</div>
                    ${a.dispositivo ? `<div class="activity-device">${a.dispositivo}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(tipo) {
        const icons = {
            'login': 'sign-in-alt',
            'logout': 'sign-out-alt',
            'cambio_password': 'key',
            'puja': 'gavel',
            'compra': 'shopping-cart',
            'donacion': 'heart'
        };
        return icons[tipo] || 'circle';
    }

    // Mostrar modal de depósito
    async mostrarModalDeposito() {
        await this.walletManager.showDepositModal();
    }

    // Mostrar modal de retiro
    async mostrarModalRetiro() {
        await this.walletManager.showWithdrawModal();
    }

    // Cargar historial de pujas
    async cargarHistorialPujas() {
        try {
            const response = await this.apiClient.getUserHistorialPujas();
            if (response.success && response.pujas) {
                return { success: true, pujas: response.pujas };
            }
            return { success: false, pujas: [] };
        } catch (error) {
            console.error('Error al cargar historial de pujas:', error);
            return { success: false, pujas: [] };
        }
    }

    // Cargar historial de compras
    async cargarHistorialCompras() {
        try {
            const response = await this.apiClient.getUserHistorialCompras();
            if (response.success && response.compras) {
                return { success: true, compras: response.compras };
            }
            return { success: false, compras: [] };
        } catch (error) {
            console.error('Error al cargar historial de compras:', error);
            return { success: false, compras: [] };
        }
    }

    // Cargar participación en rifas
    async cargarParticipacionRifas() {
        try {
            const response = await this.apiClient.getUserHistorialRifas();
            if (response.success && response.rifas) {
                return { success: true, rifas: response.rifas };
            }
            return { success: false, rifas: [] };
        } catch (error) {
            console.error('Error al cargar participación en rifas:', error);
            return { success: false, rifas: [] };
        }
    }

    // Eliminar cuenta
    async eliminarCuenta(password) {
        try {
            const response = await this.apiClient.deleteUserCuenta(password);
            if (response.success) {
                return { success: true, message: 'Cuenta eliminada correctamente' };
            }
            return { success: false, message: response.message || 'Error al eliminar cuenta' };
        } catch (error) {
            console.error('Error al eliminar cuenta:', error);
            return { success: false, message: error.message };
        }
    }
}

// Crear instancia global
const perfilManager = new PerfilManager();
