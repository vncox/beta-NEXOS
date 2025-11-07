/**
 * Manager de Subastas - Conectado al Backend
 * Maneja todas las operaciones de subastas desde la API REST
 */

class SubastasManager {
    constructor() {
        this.subastas = [];
        this.currentSubasta = null;
    }

    /**
     * Obtener todas las subastas con filtros
     */
    async getSubastas(filtros = {}) {
        try {
            const data = await apiClient.getSubastas(filtros);
            this.subastas = data.subastas || [];
            return {
                success: true,
                subastas: this.subastas,
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
     * Obtener subasta por ID
     */
    async getSubastaById(id) {
        try {
            const subasta = await apiClient.getSubastaById(id);
            this.currentSubasta = subasta;
            return {
                success: true,
                subasta
            };
        } catch (error) {
            console.error('Error obteniendo subasta:', error);
            return {
                success: false,
                message: error.message || 'Error al cargar subasta'
            };
        }
    }

    /**
     * Crear nueva subasta (solo empresas)
     */
    async createSubasta(subastaData) {
        try {
            if (!auth.isLoggedIn()) {
                return {
                    success: false,
                    message: 'Debes iniciar sesión para crear una subasta'
                };
            }

            if (!auth.isEmpresa() && !auth.isAdmin()) {
                return {
                    success: false,
                    message: 'Solo las empresas pueden crear subastas'
                };
            }

            const result = await apiClient.createSubasta(subastaData);
            return {
                success: true,
                message: 'Subasta creada exitosamente',
                subasta: result.subasta
            };
        } catch (error) {
            console.error('Error creando subasta:', error);
            return {
                success: false,
                message: error.message || 'Error al crear subasta'
            };
        }
    }

    /**
     * Actualizar subasta
     */
    async updateSubasta(id, subastaData) {
        try {
            const result = await apiClient.updateSubasta(id, subastaData);
            return {
                success: true,
                message: 'Subasta actualizada exitosamente',
                subasta: result.subasta
            };
        } catch (error) {
            console.error('Error actualizando subasta:', error);
            return {
                success: false,
                message: error.message || 'Error al actualizar subasta'
            };
        }
    }

    /**
     * Eliminar subasta
     */
    async deleteSubasta(id) {
        try {
            await apiClient.deleteSubasta(id);
            return {
                success: true,
                message: 'Subasta eliminada exitosamente'
            };
        } catch (error) {
            console.error('Error eliminando subasta:', error);
            return {
                success: false,
                message: error.message || 'Error al eliminar subasta'
            };
        }
    }

    /**
     * Publicar subasta
     */
    async publicarSubasta(id) {
        try {
            const result = await apiClient.publicarSubasta(id);
            return {
                success: true,
                message: 'Subasta publicada exitosamente',
                subasta: result.subasta
            };
        } catch (error) {
            console.error('Error publicando subasta:', error);
            return {
                success: false,
                message: error.message || 'Error al publicar subasta'
            };
        }
    }

    /**
     * Finalizar subasta
     */
    async finalizarSubasta(id) {
        try {
            const result = await apiClient.finalizarSubasta(id);
            return {
                success: true,
                message: 'Subasta finalizada exitosamente',
                subasta: result.subasta,
                ganador: result.ganador
            };
        } catch (error) {
            console.error('Error finalizando subasta:', error);
            return {
                success: false,
                message: error.message || 'Error al finalizar subasta'
            };
        }
    }

    /**
     * Crear puja
     */
    async crearPuja(subastaId, monto) {
        try {
            if (!auth.isLoggedIn()) {
                return {
                    success: false,
                    message: 'Debes iniciar sesión para pujar'
                };
            }

            const result = await apiClient.createPuja(subastaId, monto);
            return {
                success: true,
                message: 'Puja realizada exitosamente',
                puja: result.puja
            };
        } catch (error) {
            console.error('Error creando puja:', error);
            return {
                success: false,
                message: error.message || 'Error al realizar puja'
            };
        }
    }

    /**
     * Obtener pujas de una subasta
     */
    async getPujasBySubasta(subastaId) {
        try {
            const data = await apiClient.getPujasBySubasta(subastaId);
            return {
                success: true,
                pujas: data.pujas || []
            };
        } catch (error) {
            console.error('Error obteniendo pujas:', error);
            return {
                success: false,
                message: error.message || 'Error al cargar pujas'
            };
        }
    }

    /**
     * Obtener mis pujas
     */
    async getMyPujas() {
        try {
            if (!auth.isLoggedIn()) {
                return {
                    success: false,
                    message: 'Debes iniciar sesión'
                };
            }

            const data = await apiClient.getMyPujas();
            return {
                success: true,
                pujas: data.pujas || []
            };
        } catch (error) {
            console.error('Error obteniendo mis pujas:', error);
            return {
                success: false,
                message: error.message || 'Error al cargar pujas'
            };
        }
    }

    /**
     * Renderizar subastas en el HTML
     */
    renderSubastas(containerId, subastas) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!subastas || subastas.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #999;">
                    <i class="fas fa-inbox fa-3x" style="margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>No hay subastas disponibles</p>
                </div>
            `;
            return;
        }

        container.innerHTML = subastas.map(subasta => this.createSubastaCard(subasta)).join('');
    }

    /**
     * Crear tarjeta HTML de subasta
     */
    createSubastaCard(subasta) {
        // Debug: ver estructura de datos
        console.log('Creando tarjeta para subasta:', {
            id: subasta.id,
            titulo: subasta.titulo,
            precio_actual: subasta.precio_actual,
            precio_inicial: subasta.precio_inicial,
            imagen: subasta.imagen,
            imagenes: subasta.imagenes,
            fecha_fin: subasta.fecha_fin,
            cantidad_pujas: subasta.cantidad_pujas,
            empresa: subasta.empresa?.razon_social
        });
        
        // Usar nombres de propiedades del backend (snake_case)
        const imagenes = Array.isArray(subasta.imagenes) && subasta.imagenes.length > 0 
            ? subasta.imagenes 
            : (subasta.imagen ? [subasta.imagen] : []);
        const imagenPrincipal = imagenes[0] || 'images/default-auction.png';
        
        // Obtener precio actual o inicial
        const precioActual = parseFloat(subasta.precio_actual || subasta.precio_inicial || 0);
        
        // Obtener información de empresa y causa
        const empresa = subasta.empresa || {};
        const causa = subasta.causa || {};
        const nombreBeneficiario = causa.titulo || causa.nombre || empresa.razon_social || 'Causa benéfica';
        
        // Calcular tiempo restante
        const tiempoRestante = this.calcularTiempoRestante(subasta.fecha_fin);
        
        // Obtener cantidad de pujas
        const numPujas = subasta.cantidad_pujas || (subasta.pujas ? subasta.pujas.length : 0);
        
        // Determinar badge según estado y tiempo
        let badge = '';
        if (subasta.estado === 'activa') {
            const diasRestantes = Math.floor((new Date(subasta.fecha_fin) - new Date()) / (1000 * 60 * 60 * 24));
            if (diasRestantes <= 1) {
                badge = '<span class="card-badge badge-ending">⏰ Termina Pronto</span>';
            } else if (numPujas > 10) {
                badge = '<span class="card-badge badge-hot">🔥 Popular</span>';
            } else {
                badge = '<span class="card-badge badge-new">✨ Activa</span>';
            }
        }

        return `
            <div class="grid-card" onclick="window.location.href='detalle-subasta.html?id=${subasta.id}'" style="cursor: pointer;">
                <div class="grid-image" style="background-image: url('${imagenPrincipal}');">
                    ${badge}
                </div>
                <div class="grid-content">
                    <h3>${subasta.titulo}</h3>
                    <p>${subasta.descripcion.substring(0, 80)}${subasta.descripcion.length > 80 ? '...' : ''}</p>
                    
                    <div class="beneficiary" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; background: rgba(231, 76, 60, 0.05); border-radius: 8px; margin: 0.5rem 0;">
                        <i class="fas fa-heart" style="color: #e74c3c;"></i>
                        <span style="font-size: 0.9rem; color: #666;">${nombreBeneficiario}</span>
                    </div>
                    
                    <div class="card-meta">
                        <div class="card-price">
                            <div style="flex: 1;">
                                <div class="price-label">Precio actual</div>
                                <div class="price-value">$${precioActual.toLocaleString('es-CL')}</div>
                            </div>
                            <div class="pujas-info">
                                <i class="fas fa-gavel"></i>
                                <span>${numPujas} ${numPujas === 1 ? 'puja' : 'pujas'}</span>
                            </div>
                        </div>
                        
                        <div class="card-time">
                            <i class="fas fa-clock"></i>
                            <span>${tiempoRestante}</span>
                        </div>
                        
                        <div class="card-actions">
                            <button class="card-button card-button-primary" onclick="event.stopPropagation(); window.location.href='detalle-subasta.html?id=${subasta.id}'">
                                <i class="fas fa-gavel"></i>
                                Ver Subasta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Calcular tiempo restante
     */
    calcularTiempoRestante(fechaFin) {
        const ahora = new Date();
        const fin = new Date(fechaFin);
        const diff = fin - ahora;

        if (diff <= 0) {
            return 'Finalizada';
        }

        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (dias > 0) return `${dias}d ${horas}h`;
        if (horas > 0) return `${horas}h ${minutos}m`;
        return `${minutos}m`;
    }

    /**
     * Cancelar subasta (admin o empresa propietaria)
     */
    async cancelarSubasta(id) {
        try {
            // Usar el endpoint de finalización con estado cancelado
            const result = await apiClient.finalizarSubasta(id);
            return {
                success: true,
                message: 'Subasta cancelada exitosamente',
                subasta: result.subasta
            };
        } catch (error) {
            console.error('Error cancelando subasta:', error);
            return {
                success: false,
                message: error.message || 'Error al cancelar subasta'
            };
        }
    }
}

// Instancia global
const subastasManager = new SubastasManager();
