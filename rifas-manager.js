// Manager para rifas
class RifasManager {
    constructor() {
        this.apiClient = new APIClient();
        this.walletManager = new WalletManager();
    }

    // Obtener todas las rifas
    async getRifas(filtros = {}) {
        try {
            console.log('🔍 getRifas llamado con filtros:', filtros);
            const response = await this.apiClient.getRifas(filtros);
            console.log('📡 Respuesta del servidor:', response);
            
            if (response.success) {
                return {
                    success: true,
                    rifas: response.rifas || [],
                    total: response.total || 0
                };
            }
            return { success: false, message: response.message };
        } catch (error) {
            console.error('❌ Error al obtener rifas:', error);
            return { success: false, message: error.message };
        }
    }

    // Obtener rifa por ID
    async getRifaById(id) {
        try {
            const response = await this.apiClient.getRifaById(id);
            if (response.success) {
                return {
                    success: true,
                    rifa: response.rifa
                };
            }
            return { success: false, message: response.message };
        } catch (error) {
            console.error('Error al obtener rifa:', error);
            return { success: false, message: error.message };
        }
    }

    // Comprar boletos
    async comprarBoletos(rifaId, cantidad) {
        try {
            const response = await this.apiClient.comprarBoletoRifa(rifaId, cantidad);
            if (response.success) {
                return {
                    success: true,
                    boletos: response.boletos,
                    message: 'Boletos comprados exitosamente'
                };
            }
            return { success: false, message: response.message };
        } catch (error) {
            console.error('Error al comprar boletos:', error);
            return { success: false, message: error.message };
        }
    }

    // Renderizar rifas en un contenedor
    renderRifas(containerId, rifas) {
        console.log('🎨 renderRifas llamado con containerId:', containerId, 'rifas:', rifas.length);
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('❌ Contenedor no encontrado:', containerId);
            return;
        }

        if (!rifas || rifas.length === 0) {
            console.log('⚠️ No hay rifas para mostrar');
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-ticket-alt" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No hay rifas disponibles en este momento</p>
                </div>
            `;
            return;
        }

        console.log('✅ Renderizando', rifas.length, 'rifas');
        container.innerHTML = rifas.map(rifa => this.createRifaCard(rifa)).join('');
        console.log('✅ Rifas renderizadas correctamente');
    }

    // Crear card HTML para una rifa
    createRifaCard(rifa) {
        const boletosVendidos = rifa.boletos_vendidos || 0;
        const boletosTotal = rifa.boletos_totales || 0;
        const progreso = boletosTotal > 0 ? (boletosVendidos / boletosTotal) * 100 : 0;
        const precioFormateado = parseFloat(rifa.precio_boleto || 0).toLocaleString('es-CL');
        const fechaSorteo = new Date(rifa.fecha_sorteo);
        const diasRestantes = Math.ceil((fechaSorteo - new Date()) / (1000 * 60 * 60 * 24));
        const estado = rifa.estado || 'activa';

        // Determinar badge según estado
        let badgeHTML = '';
        if (estado === 'finalizada') {
            badgeHTML = '<span class="badge badge-hot">🏁 Finalizada</span>';
        } else if (diasRestantes <= 3 && diasRestantes > 0) {
            badgeHTML = '<span class="badge badge-ending">⏰ ¡Últimos días!</span>';
        } else if (progreso >= 80) {
            badgeHTML = '<span class="badge badge-hot">🔥 Casi agotado</span>';
        } else if (estado === 'activa') {
            badgeHTML = '<span class="badge badge-new">✨ Activa</span>';
        }

        return `
            <div class="grid-card" onclick="window.location.href='detalle-rifa.html?id=${rifa.id}'" style="cursor: pointer;">
                <div class="card-image-container">
                    <img src="${rifa.imagen || 'images/default-rifa.jpg'}" alt="${rifa.titulo}" class="card-image">
                    <div class="card-overlay"></div>
                    <div class="card-badges">
                        ${badgeHTML}
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <h3 class="card-title">${rifa.titulo}</h3>
                    </div>
                    <p class="card-description">${(rifa.descripcion || '').substring(0, 100)}${rifa.descripcion && rifa.descripcion.length > 100 ? '...' : ''}</p>
                    
                    <div class="card-progress">
                        <div class="progress-header">
                            <span class="progress-label">Boletos vendidos</span>
                            <span class="progress-value">${boletosVendidos} / ${boletosTotal}</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${progreso}%"></div>
                        </div>
                        <div class="progress-footer">
                            <span class="progress-percentage">${progreso.toFixed(1)}% vendido</span>
                        </div>
                    </div>

                    <div class="card-metadata">
                        <div class="metadata-item">
                            <i class="fas fa-ticket-alt"></i>
                            <div class="metadata-content">
                                <span class="metadata-label">Precio boleto</span>
                                <span class="metadata-value">$${precioFormateado}</span>
                            </div>
                        </div>
                        <div class="metadata-item">
                            <i class="fas fa-calendar-alt"></i>
                            <div class="metadata-content">
                                <span class="metadata-label">Sorteo</span>
                                <span class="metadata-value">${diasRestantes > 0 ? diasRestantes + ' días' : 'Hoy'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="card-footer">
                        ${rifa.empresa && rifa.empresa.razon_social ? `
                            <div class="card-company">
                                <i class="fas fa-building"></i>
                                <span>${rifa.empresa.razon_social}</span>
                            </div>
                        ` : ''}
                        <div class="card-actions">
                            <button class="btn-comprar" onclick="event.stopPropagation(); rifasManager.mostrarModalCompra('${rifa.id}')">
                                <i class="fas fa-shopping-cart"></i> Comprar Boletos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Mostrar modal de compra
    async mostrarModalCompra(rifaId) {
        // Verificar login
        if (!auth || !auth.isLoggedIn || !auth.isLoggedIn()) {
            notify.warning('Debes iniciar sesión para comprar boletos');
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }

        // Obtener datos de la rifa
        const result = await this.getRifaById(rifaId);
        if (!result.success) {
            notify.error('Error al cargar la rifa');
            return;
        }

        const rifa = result.rifa;
        const boletosDisponibles = rifa.boletos_totales - rifa.boletos_vendidos;
        const precioFormateado = rifa.precio_boleto.toLocaleString('es-CL');

        // Crear modal
        const modalHTML = `
            <div id="modal-compra-rifa" class="modal" style="display: flex;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Comprar Boletos</h2>
                        <button class="modal-close" onclick="rifasManager.cerrarModalCompra()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="rifa-info-modal">
                            <img src="${rifa.imagen || 'images/default-rifa.jpg'}" alt="${rifa.titulo}" style="width: 100%; border-radius: 10px; margin-bottom: 1rem;">
                            <h3>${rifa.titulo}</h3>
                            <p style="color: #666;">${rifa.descripcion}</p>
                        </div>
                        
                        <form id="form-compra-boletos" onsubmit="rifasManager.procesarCompra(event, ${rifaId})">
                            <div class="form-group">
                                <label>Cantidad de boletos</label>
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <button type="button" class="btn-cantidad" onclick="rifasManager.cambiarCantidad(-1)">
                                        <i class="fas fa-minus"></i>
                                    </button>
                                    <input type="number" id="cantidad-boletos" name="cantidad" 
                                           value="1" min="1" max="${Math.min(boletosDisponibles, 10)}" 
                                           style="text-align: center; font-size: 1.5rem; font-weight: bold; width: 80px;"
                                           oninput="rifasManager.actualizarTotal()">
                                    <button type="button" class="btn-cantidad" onclick="rifasManager.cambiarCantidad(1)">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                                <small style="color: #666;">Disponibles: ${boletosDisponibles} boletos</small>
                            </div>

                            <div class="precio-info" style="background: #f8f9fa; padding: 1rem; border-radius: 10px; margin: 1rem 0;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span>Precio por boleto:</span>
                                    <strong>$${precioFormateado}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 1.2rem; color: var(--primary);">
                                    <span><strong>Total:</strong></span>
                                    <strong id="total-compra">$${precioFormateado}</strong>
                                </div>
                            </div>

                            <input type="hidden" id="precio-boleto" value="${rifa.precio_boleto}">
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="rifasManager.cerrarModalCompra()">
                                    Cancelar
                                </button>
                                <button type="submit" class="btn-primary">
                                    <i class="fas fa-shopping-cart"></i> Comprar Boletos
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Insertar modal
        const existingModal = document.getElementById('modal-compra-rifa');
        if (existingModal) {
            existingModal.remove();
        }
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Cambiar cantidad de boletos
    cambiarCantidad(delta) {
        const input = document.getElementById('cantidad-boletos');
        if (!input) return;

        const newValue = parseInt(input.value) + delta;
        const min = parseInt(input.min);
        const max = parseInt(input.max);

        if (newValue >= min && newValue <= max) {
            input.value = newValue;
            this.actualizarTotal();
        }
    }

    // Actualizar total
    actualizarTotal() {
        const cantidad = parseInt(document.getElementById('cantidad-boletos')?.value || 1);
        const precio = parseInt(document.getElementById('precio-boleto')?.value || 0);
        const total = cantidad * precio;
        
        const totalElement = document.getElementById('total-compra');
        if (totalElement) {
            totalElement.textContent = '$' + total.toLocaleString('es-CL');
        }
    }

    // Procesar compra
    async procesarCompra(event, rifaId) {
        event.preventDefault();
        
        const cantidad = parseInt(document.getElementById('cantidad-boletos').value);
        const precio = parseInt(document.getElementById('precio-boleto').value);
        const total = cantidad * precio;

        // Verificar saldo
        const walletResult = await this.walletManager.getWallet();
        if (!walletResult.success || walletResult.wallet.saldo < total) {
            notify.error('Saldo insuficiente. Recarga tu wallet.');
            return;
        }

        // Confirmar
        if (!confirm(`¿Confirmas la compra de ${cantidad} boleto${cantidad !== 1 ? 's' : ''} por $${total.toLocaleString('es-CL')}?`)) {
            return;
        }

        // Realizar compra
        const result = await this.comprarBoletos(rifaId, cantidad);

        if (result.success) {
            notify.success(`¡Boletos comprados! Números: ${result.boletos.map(b => b.numero).join(', ')} 🎉`);
            this.cerrarModalCompra();
            
            // Recargar rifas
            await this.cargarRifasEnPagina();
        } else {
            notify.error(result.message || 'Error al comprar boletos');
        }
    }

    // Cerrar modal
    cerrarModalCompra() {
        const modal = document.getElementById('modal-compra-rifa');
        if (modal) {
            modal.remove();
        }
    }

    // Cargar rifas en la página
    async cargarRifasEnPagina(filtros = {}) {
        console.log('🎯 cargarRifasEnPagina iniciado con filtros:', filtros);
        const container = document.getElementById('rifas-lista');
        console.log('📦 Contenedor encontrado:', container);
        
        const result = await this.getRifas(filtros);
        console.log('📊 Resultado de getRifas:', result);
        
        if (result.success) {
            console.log('✅ Éxito - Rifas obtenidas:', result.rifas.length);
            this.renderRifas('rifas-lista', result.rifas);
        } else {
            console.error('❌ Error al cargar rifas:', result.message);
            if (typeof notify !== 'undefined') {
                notify.error('Error al cargar rifas');
            } else {
                console.error('notify no está definido');
            }
        }
    }

    // Filtrar rifas
    filtrarRifas() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const estadoFilter = document.getElementById('filterEstado')?.value || 'todas';

        const filtros = {};
        if (estadoFilter !== 'todas') {
            filtros.estado = estadoFilter;
        }

        this.cargarRifasEnPagina(filtros);
    }

    // Cancelar rifa (admin)
    async cancelarRifa(id) {
        try {
            // TODO: Implementar endpoint de cancelación en backend
            // Por ahora, usar actualización genérica
            const response = await this.apiClient.put(`/rifas/${id}`, { estado: 'cancelada' });
            return {
                success: true,
                message: 'Rifa cancelada exitosamente'
            };
        } catch (error) {
            console.error('Error al cancelar rifa:', error);
            return {
                success: false,
                message: error.message || 'Error al cancelar rifa'
            };
        }
    }

    // Realizar sorteo (admin)
    async realizarSorteo(id) {
        try {
            // TODO: Implementar endpoint de sorteo en backend
            const response = await this.apiClient.post(`/rifas/${id}/sortear`, {});
            return {
                success: true,
                message: 'Sorteo realizado exitosamente',
                ganador: response.ganador
            };
        } catch (error) {
            console.error('Error al realizar sorteo:', error);
            return {
                success: false,
                message: error.message || 'Error al realizar sorteo'
            };
        }
    }
}

// Crear instancia global
const rifasManager = new RifasManager();
