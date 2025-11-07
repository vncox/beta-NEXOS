// Manager para causas sociales
class CausasManager {
    constructor() {
        this.apiClient = new APIClient();
        this.walletManager = new WalletManager();
    }

    // Obtener todas las causas
    async getCausas(filtros = {}) {
        try {
            const response = await this.apiClient.getCausas(filtros);
            if (response.success) {
                return {
                    success: true,
                    causas: response.causas || [],
                    total: response.total || 0
                };
            }
            return { success: false, message: response.message };
        } catch (error) {
            console.error('Error al obtener causas:', error);
            return { success: false, message: error.message };
        }
    }

    // Obtener causa por ID
    async getCausaById(id) {
        try {
            const response = await this.apiClient.getCausaById(id);
            if (response.success) {
                return {
                    success: true,
                    causa: response.causa
                };
            }
            return { success: false, message: response.message };
        } catch (error) {
            console.error('Error al obtener causa:', error);
            return { success: false, message: error.message };
        }
    }

    // Realizar donación
    async donar(causaId, monto, mensaje = '') {
        try {
            const response = await this.apiClient.createDonacion({
                causaId: causaId,
                monto: monto,
                mensaje: mensaje
            });

            if (response.success) {
                return {
                    success: true,
                    donacion: response.donacion,
                    message: 'Donación realizada exitosamente'
                };
            }
            return { success: false, message: response.message };
        } catch (error) {
            console.error('Error al donar:', error);
            return { success: false, message: error.message };
        }
    }

    // Renderizar causas en un contenedor
    renderCausas(containerId, causas) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!causas || causas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart-broken" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No hay causas disponibles en este momento</p>
                </div>
            `;
            return;
        }

        container.innerHTML = causas.map(causa => this.createCausaCard(causa)).join('');
    }

    // Crear card HTML para una causa
    createCausaCard(causa) {
        const progreso = causa.montoRecaudado && causa.montoObjetivo 
            ? Math.min((causa.montoRecaudado / causa.montoObjetivo) * 100, 100) 
            : 0;

        const montoRecaudado = causa.montoRecaudado || 0;
        const montoObjetivo = causa.montoObjetivo || 0;
        const donadores = causa.donacionesCount || 0;
        const estado = causa.estado || 'activa';

        return `
            <div class="charity-card" data-causa-id="${causa.id}">
                <div class="charity-image" style="background-image: url('${causa.imagen || 'images/default-causa.jpg'}');">
                    ${estado === 'finalizada' ? '<span class="badge badge-finalizada">Finalizada</span>' : ''}
                    ${estado === 'pausada' ? '<span class="badge badge-pausada">Pausada</span>' : ''}
                </div>
                <div class="charity-content">
                    <div class="charity-header">
                        <div class="charity-icon">
                            <i class="fas fa-${this.getCausaIcon(causa.categoria)}"></i>
                        </div>
                        <h3 class="charity-name">${causa.titulo}</h3>
                    </div>
                    
                    <p class="charity-desc">${causa.descripcion}</p>
                    
                    ${causa.organizacion ? `
                        <div class="charity-org">
                            <i class="fas fa-building"></i>
                            <span>${causa.organizacion}</span>
                        </div>
                    ` : ''}
                    
                    <div class="progress-section">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progreso}%"></div>
                        </div>
                        <div class="progress-info">
                            <span class="progress-amount">$${montoRecaudado.toLocaleString('es-CL')}</span>
                            <span class="progress-goal">de $${montoObjetivo.toLocaleString('es-CL')}</span>
                        </div>
                        <div class="progress-stats">
                            <span><i class="fas fa-users"></i> ${donadores} donador${donadores !== 1 ? 'es' : ''}</span>
                            <span><i class="fas fa-chart-line"></i> ${progreso.toFixed(0)}%</span>
                        </div>
                    </div>
                    
                    <div class="charity-actions">
                        ${estado === 'activa' ? `
                            <button class="btn-donar btn-primary" onclick="causasManager.mostrarModalDonacion('${causa.id}')">
                                <i class="fas fa-hand-holding-heart"></i> Donar
                            </button>
                        ` : `
                            <button class="btn-disabled" disabled>
                                <i class="fas fa-lock"></i> ${estado === 'finalizada' ? 'Finalizada' : 'Pausada'}
                            </button>
                        `}
                        <button class="btn-secondary" onclick="causasManager.mostrarModalDonacion('${causa.id}')">
                            <i class="fas fa-info-circle"></i> Ver más
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Obtener icono según categoría
    getCausaIcon(categoria) {
        const icons = {
            'salud': 'heartbeat',
            'educacion': 'graduation-cap',
            'medio-ambiente': 'leaf',
            'animales': 'paw',
            'ninos': 'child',
            'ancianos': 'hands-helping',
            'pobreza': 'hand-holding-usd',
            'discapacidad': 'wheelchair',
            'emergencia': 'exclamation-triangle',
            'deporte': 'futbol',
            'cultura': 'palette',
            'otro': 'heart'
        };
        return icons[categoria] || 'heart';
    }

    // Mostrar modal de donación
    async mostrarModalDonacion(causaId) {
        // Verificar que esté logueado
        if (!auth || !auth.isLoggedIn || !auth.isLoggedIn()) {
            notify.warning('Debes iniciar sesión para donar');
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }

        // Obtener datos de la causa
        const result = await this.getCausaById(causaId);
        if (!result.success) {
            notify.error('Error al cargar la causa');
            return;
        }

        const causa = result.causa;

        // Crear modal
        const modalHTML = `
            <div id="modal-donacion" class="modal" style="display: flex;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Realizar Donación</h2>
                        <button class="modal-close" onclick="causasManager.cerrarModalDonacion()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="causa-info">
                            <h3>${causa.titulo}</h3>
                            <p>${causa.organizacion || ''}</p>
                        </div>
                        
                        <form id="form-donacion" onsubmit="causasManager.procesarDonacion(event, '${causaId}')">
                            <div class="form-group">
                                <label>Monto a donar</label>
                                <div class="monto-options">
                                    <button type="button" class="monto-btn" onclick="causasManager.seleccionarMonto(5000)">$5.000</button>
                                    <button type="button" class="monto-btn" onclick="causasManager.seleccionarMonto(10000)">$10.000</button>
                                    <button type="button" class="monto-btn" onclick="causasManager.seleccionarMonto(20000)">$20.000</button>
                                    <button type="button" class="monto-btn" onclick="causasManager.seleccionarMonto(50000)">$50.000</button>
                                </div>
                                <input type="number" id="monto-donacion" name="monto" 
                                       placeholder="O ingresa otro monto" 
                                       min="1000" step="1000" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Mensaje (opcional)</label>
                                <textarea id="mensaje-donacion" name="mensaje" 
                                         placeholder="Deja un mensaje de apoyo..."
                                         rows="3" maxlength="500"></textarea>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="causasManager.cerrarModalDonacion()">
                                    Cancelar
                                </button>
                                <button type="submit" class="btn-primary">
                                    <i class="fas fa-heart"></i> Donar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Insertar en el body
        const existingModal = document.getElementById('modal-donacion');
        if (existingModal) {
            existingModal.remove();
        }
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Seleccionar monto predefinido
    seleccionarMonto(monto) {
        const input = document.getElementById('monto-donacion');
        if (input) {
            input.value = monto;
        }

        // Resaltar botón seleccionado
        document.querySelectorAll('.monto-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.target.classList.add('selected');
    }

    // Procesar donación
    async procesarDonacion(event, causaId) {
        event.preventDefault();
        
        const form = event.target;
        const monto = parseInt(form.monto.value);
        const mensaje = form.mensaje.value.trim();

        if (monto < 1000) {
            notify.error('El monto mínimo es $1.000');
            return;
        }

        // Verificar saldo
        const walletResult = await this.walletManager.getWallet();
        if (!walletResult.success || walletResult.wallet.saldo < monto) {
            notify.error('Saldo insuficiente. Recarga tu wallet.');
            return;
        }

        // Confirmar
        if (!confirm(`¿Confirmas la donación de $${monto.toLocaleString('es-CL')}?`)) {
            return;
        }

        // Realizar donación
        const result = await this.donar(causaId, monto, mensaje);

        if (result.success) {
            notify.success(`¡Gracias por tu donación de $${monto.toLocaleString('es-CL')}! 💚`);
            this.cerrarModalDonacion();
            
            // Recargar causas para actualizar el progreso
            await this.cargarCausasEnPagina();
        } else {
            notify.error(result.message || 'Error al procesar la donación');
        }
    }

    // Cerrar modal de donación
    cerrarModalDonacion() {
        const modal = document.getElementById('modal-donacion');
        if (modal) {
            modal.remove();
        }
    }

    // Cargar causas en la página actual
    async cargarCausasEnPagina(filtros = {}) {
        const result = await this.getCausas(filtros);
        if (result.success) {
            this.renderCausas('causas-lista', result.causas);
        } else {
            notify.error('Error al cargar causas');
        }
    }
}

// Crear instancia global
const causasManager = new CausasManager();
