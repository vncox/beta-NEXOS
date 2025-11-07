/**
 * Admin Manager - Panel de Administración
 * Maneja todas las funciones administrativas
 */

class AdminManager {
    constructor() {
        this.estadisticas = null;
        this.empresasPendientes = [];
        this.usuarios = [];
    }

    /**
     * Obtener estadísticas del sistema
     */
    async getEstadisticas() {
        try {
            const data = await apiClient.getEstadisticas();
            this.estadisticas = data;
            return {
                success: true,
                estadisticas: data
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return {
                success: false,
                message: error.message || 'Error al cargar estadísticas'
            };
        }
    }

    /**
     * Obtener empresas con filtros
     */
    async getEmpresas(filtros = {}) {
        try {
            const data = await apiClient.getEmpresasAdmin(filtros);
            if (filtros.estado === 'pendiente') {
                this.empresasPendientes = data.empresas || [];
            }
            return {
                success: true,
                empresas: data.empresas || [],
                total: data.total
            };
        } catch (error) {
            console.error('Error obteniendo empresas:', error);
            return {
                success: false,
                message: error.message || 'Error al cargar empresas'
            };
        }
    }

    /**
     * Obtener usuarios del sistema
     */
    async getUsuarios(filtros = {}) {
        try {
            const data = await apiClient.getUsuariosAdmin(filtros);
            this.usuarios = data.usuarios || [];
            return {
                success: true,
                usuarios: this.usuarios,
                total: data.total
            };
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            return {
                success: false,
                message: error.message || 'Error al cargar usuarios'
            };
        }
    }

    /**
     * Aprobar empresa
     */
    async aprobarEmpresa(id) {
        try {
            const result = await apiClient.aprobarEmpresa(id);
            return {
                success: true,
                message: 'Empresa aprobada exitosamente',
                empresa: result.empresa
            };
        } catch (error) {
            console.error('Error aprobando empresa:', error);
            return {
                success: false,
                message: error.message || 'Error al aprobar empresa'
            };
        }
    }

    /**
     * Rechazar empresa
     */
    async rechazarEmpresa(id, motivo) {
        try {
            const result = await apiClient.rechazarEmpresa(id, motivo);
            return {
                success: true,
                message: 'Empresa rechazada',
                empresa: result.empresa
            };
        } catch (error) {
            console.error('Error rechazando empresa:', error);
            return {
                success: false,
                message: error.message || 'Error al rechazar empresa'
            };
        }
    }

    /**
     * Activar/desactivar usuario
     */
    async toggleUsuarioActivo(id) {
        try {
            const result = await apiClient.toggleUsuarioActivo(id);
            return {
                success: true,
                message: result.message,
                usuario: result.usuario
            };
        } catch (error) {
            console.error('Error toggling usuario:', error);
            return {
                success: false,
                message: error.message || 'Error al actualizar usuario'
            };
        }
    }

    /**
     * Eliminar usuario
     */
    async deleteUsuario(id) {
        try {
            await apiClient.deleteUsuarioAdmin(id);
            return {
                success: true,
                message: 'Usuario eliminado exitosamente'
            };
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            return {
                success: false,
                message: error.message || 'Error al eliminar usuario'
            };
        }
    }

    /**
     * Obtener subastas para admin
     */
    async getSubastas(filtros = {}) {
        try {
            const data = await apiClient.getSubastasAdmin(filtros);
            return {
                success: true,
                subastas: data.subastas || [],
                total: data.total
            };
        } catch (error) {
            console.error('Error obteniendo subastas:', error);
            return {
                success: false,
                message: error.message || 'Error al cargar subastas'
            };
        }
    }

    /**
     * Obtener reporte de transacciones
     */
    async getReporteTransacciones(filtros = {}) {
        try {
            const data = await apiClient.getReporteTransacciones(filtros);
            return {
                success: true,
                transacciones: data.transacciones || [],
                total: data.total,
                totalesPorTipo: data.totalesPorTipo || []
            };
        } catch (error) {
            console.error('Error obteniendo reporte:', error);
            return {
                success: false,
                message: error.message || 'Error al cargar reporte'
            };
        }
    }

    /**
     * Obtener reporte de donaciones
     */
    async getReporteDonaciones() {
        try {
            const data = await apiClient.getReporteDonaciones();
            return {
                success: true,
                donacionesPorCausa: data.donacionesPorCausa || []
            };
        } catch (error) {
            console.error('Error obteniendo reporte:', error);
            return {
                success: false,
                message: error.message || 'Error al cargar reporte'
            };
        }
    }

    /**
     * Renderizar estadísticas en dashboard
     */
    renderEstadisticas(containerId) {
        if (!this.estadisticas) {
            console.warn('No hay estadísticas para renderizar');
            return;
        }

        const stats = this.estadisticas;
        
        // Actualizar Total de Cuentas
        const totalCuentas = (stats.totalUsuarios || 0) + (stats.totalEmpresas || 0);
        this.updateElement('dash-total-cuentas', totalCuentas);
        this.updateElement('dash-total-users', stats.totalUsuarios || 0);
        this.updateElement('dash-total-empresas', stats.totalEmpresas || 0);

        // Actualizar Circulación Total
        const circulacionTotal = stats.circulacionTotal || 0;
        this.updateElement('dash-circulacion-total', `$${circulacionTotal.toLocaleString('es-CL')}`);
        this.updateElement('dash-total-transacciones', stats.totalTransacciones || 0);

        // Actualizar Subastas Activas
        this.updateElement('dash-subastas-activas', stats.subastasActivas || 0);

        // Actualizar Solicitudes Pendientes
        this.updateElement('dash-solicitudes-pendientes', stats.empresasPendientes || 0);

        // Actualizar Rifas Activas
        this.updateElement('dash-rifas-activas', stats.rifasActivas || 0);
        const rifasIngresos = stats.rifasIngresos || 0;
        this.updateElement('dash-rifas-ingresos', `$${rifasIngresos.toLocaleString('es-CL')}`);

        // Actualizar Productos Activos
        this.updateElement('dash-productos-activos', stats.productosActivos || 0);
        this.updateElement('dash-productos-vendidos', stats.productosVendidos || 0);

        console.log('Dashboard actualizado con estadísticas del backend');
    }

    /**
     * Actualizar elemento del DOM
     */
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`Elemento no encontrado: ${id}`);
        }
    }

    /**
     * Renderizar empresas pendientes
     */
    renderEmpresasPendientes(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!this.empresasPendientes || this.empresasPendientes.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #999;">
                    <i class="fas fa-check-circle fa-3x" style="margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>No hay empresas pendientes de aprobación</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.empresasPendientes.map(empresa => `
            <div style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem;">
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 0.5rem 0; color: var(--primary);">
                            <i class="fas fa-building"></i> ${empresa.razonSocial}
                        </h3>
                        <p style="margin: 0.25rem 0; color: #666;">
                            <i class="fas fa-id-card"></i> RUT: ${empresa.rut}
                        </p>
                        <p style="margin: 0.25rem 0; color: #666;">
                            <i class="fas fa-envelope"></i> ${empresa.email}
                        </p>
                        <p style="margin: 0.25rem 0; color: #666;">
                            <i class="fas fa-phone"></i> ${empresa.telefono || 'No especificado'}
                        </p>
                        <p style="margin: 0.25rem 0; color: #666;">
                            <i class="fas fa-calendar"></i> Registrada: ${new Date(empresa.createdAt).toLocaleDateString('es-CL')}
                        </p>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="adminManager.aprobarEmpresaUI('${empresa.id}')" 
                            style="padding: 0.75rem 1.5rem; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-check"></i> Aprobar
                        </button>
                        <button onclick="adminManager.rechazarEmpresaUI('${empresa.id}')" 
                            style="padding: 0.75rem 1.5rem; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-times"></i> Rechazar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Aprobar empresa desde UI
     */
    async aprobarEmpresaUI(id) {
        if (!confirm('¿Estás seguro de aprobar esta empresa?')) return;

        const result = await this.aprobarEmpresa(id);
        if (result.success) {
            alert('✅ ' + result.message);
            // Recargar empresas pendientes
            await this.getEmpresas({ estado: 'pendiente' });
            this.renderEmpresasPendientes('empresas-pendientes-list');
        } else {
            alert('❌ ' + result.message);
        }
    }

    /**
     * Rechazar empresa desde UI
     */
    async rechazarEmpresaUI(id) {
        const motivo = prompt('Ingresa el motivo del rechazo:');
        if (!motivo) return;

        const result = await this.rechazarEmpresa(id, motivo);
        if (result.success) {
            alert('✅ Empresa rechazada');
            // Recargar empresas pendientes
            await this.getEmpresas({ estado: 'pendiente' });
            this.renderEmpresasPendientes('empresas-pendientes-list');
        } else {
            alert('❌ ' + result.message);
        }
    }

    /**
     * Activar/desactivar empresa
     */
    async toggleEmpresaActiva(id) {
        try {
            const result = await apiClient.toggleEmpresaActiva(id);
            return {
                success: true,
                message: result.message || 'Estado de empresa actualizado',
                empresa: result.empresa
            };
        } catch (error) {
            console.error('Error toggling empresa:', error);
            return {
                success: false,
                message: error.message || 'Error al actualizar empresa'
            };
        }
    }

    /**
     * Eliminar empresa
     */
    async deleteEmpresa(id) {
        try {
            await apiClient.deleteEmpresaAdmin(id);
            return {
                success: true,
                message: 'Empresa eliminada exitosamente'
            };
        } catch (error) {
            console.error('Error eliminando empresa:', error);
            return {
                success: false,
                message: error.message || 'Error al eliminar empresa'
            };
        }
    }
}

// Instancia global
const adminManager = new AdminManager();
