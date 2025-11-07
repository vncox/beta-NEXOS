/**
 * Wallet Manager - Sistema de Billetera
 * Maneja depósitos, retiros y transacciones
 */

class WalletManager {
    constructor() {
        this.saldoActual = 0;
        this.transacciones = [];
    }

    /**
     * Obtener información de la wallet
     */
    async getWallet() {
        try {
            if (!auth.isLoggedIn()) {
                return {
                    success: false,
                    message: 'Debes iniciar sesión'
                };
            }

            const data = await apiClient.getWallet();
            this.saldoActual = parseFloat(data.saldo || 0);
            
            return {
                success: true,
                saldo: this.saldoActual,
                wallet: data
            };
        } catch (error) {
            console.error('Error obteniendo wallet:', error);
            return {
                success: false,
                message: error.message || 'Error al cargar wallet'
            };
        }
    }

    /**
     * Depositar dinero
     */
    async deposit(monto, metodoPago = 'tarjeta') {
        try {
            if (!auth.isLoggedIn()) {
                return {
                    success: false,
                    message: 'Debes iniciar sesión'
                };
            }

            const montoFloat = parseFloat(monto);
            if (isNaN(montoFloat) || montoFloat <= 0) {
                return {
                    success: false,
                    message: 'Monto inválido'
                };
            }

            const result = await apiClient.depositWallet(montoFloat, metodoPago);
            
            // Actualizar saldo local y en auth
            this.saldoActual = parseFloat(result.nuevoSaldo);
            const user = auth.getCurrentUser();
            user.saldo = result.nuevoSaldo;
            localStorage.setItem('nexos_user', JSON.stringify(user));
            
            return {
                success: true,
                message: 'Depósito realizado exitosamente',
                nuevoSaldo: this.saldoActual,
                transaccion: result.transaccion
            };
        } catch (error) {
            console.error('Error en depósito:', error);
            return {
                success: false,
                message: error.message || 'Error al realizar depósito'
            };
        }
    }

    /**
     * Retirar dinero
     */
    async withdraw(monto) {
        try {
            if (!auth.isLoggedIn()) {
                return {
                    success: false,
                    message: 'Debes iniciar sesión'
                };
            }

            const montoFloat = parseFloat(monto);
            if (isNaN(montoFloat) || montoFloat <= 0) {
                return {
                    success: false,
                    message: 'Monto inválido'
                };
            }

            if (montoFloat > this.saldoActual) {
                return {
                    success: false,
                    message: 'Saldo insuficiente'
                };
            }

            const result = await apiClient.withdrawWallet(montoFloat);
            
            // Actualizar saldo local y en auth
            this.saldoActual = parseFloat(result.nuevoSaldo);
            const user = auth.getCurrentUser();
            user.saldo = result.nuevoSaldo;
            localStorage.setItem('nexos_user', JSON.stringify(user));
            
            return {
                success: true,
                message: 'Retiro realizado exitosamente',
                nuevoSaldo: this.saldoActual,
                transaccion: result.transaccion
            };
        } catch (error) {
            console.error('Error en retiro:', error);
            return {
                success: false,
                message: error.message || 'Error al realizar retiro'
            };
        }
    }

    /**
     * Obtener historial de transacciones
     */
    async getTransacciones(limit = 10, offset = 0) {
        try {
            if (!auth.isLoggedIn()) {
                return {
                    success: false,
                    message: 'Debes iniciar sesión'
                };
            }

            const data = await apiClient.getWalletTransactions(limit, offset);
            this.transacciones = data.transacciones || [];
            
            return {
                success: true,
                transacciones: this.transacciones,
                total: data.total
            };
        } catch (error) {
            console.error('Error obteniendo transacciones:', error);
            return {
                success: false,
                message: error.message || 'Error al cargar transacciones'
            };
        }
    }

    /**
     * Mostrar modal de depósito
     */
    showDepositModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-box" style="max-width: 500px;">
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                <h3 style="color: var(--primary); margin-bottom: 1.5rem;">
                    <i class="fas fa-plus-circle"></i> Depositar Fondos
                </h3>
                
                <form id="formDeposito" onsubmit="return false;">
                    <div class="form-group">
                        <label class="form-label">Monto a depositar</label>
                        <input type="number" id="montoDeposito" class="form-input" 
                            placeholder="10000" min="1000" step="1000" required>
                        <small style="color: #666;">Mínimo: $1.000</small>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Método de pago</label>
                        <select id="metodoPago" class="form-input">
                            <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                            <option value="transferencia">Transferencia Bancaria</option>
                            <option value="webpay">Webpay</option>
                        </select>
                    </div>
                    
                    <button type="button" class="btn-primary" onclick="walletManager.procesarDeposito()">
                        <i class="fas fa-check"></i> Confirmar Depósito
                    </button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Mostrar modal de retiro
     */
    showWithdrawModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-box" style="max-width: 500px;">
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                <h3 style="color: var(--primary); margin-bottom: 1.5rem;">
                    <i class="fas fa-minus-circle"></i> Retirar Fondos
                </h3>
                
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem;">
                    <div style="color: #666; font-size: 0.9rem;">Saldo disponible</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary);">
                        $${this.saldoActual.toLocaleString('es-CL')}
                    </div>
                </div>
                
                <form id="formRetiro" onsubmit="return false;">
                    <div class="form-group">
                        <label class="form-label">Monto a retirar</label>
                        <input type="number" id="montoRetiro" class="form-input" 
                            placeholder="10000" min="1000" step="1000" 
                            max="${this.saldoActual}" required>
                        <small style="color: #666;">Máximo: $${this.saldoActual.toLocaleString('es-CL')}</small>
                    </div>
                    
                    <button type="button" class="btn-primary" onclick="walletManager.procesarRetiro()">
                        <i class="fas fa-check"></i> Confirmar Retiro
                    </button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Procesar depósito
     */
    async procesarDeposito() {
        const monto = document.getElementById('montoDeposito').value;
        const metodoPago = document.getElementById('metodoPago').value;
        const btn = event.target;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        
        const result = await this.deposit(monto, metodoPago);
        
        if (result.success) {
            alert('✅ ' + result.message + '\nNuevo saldo: $' + result.nuevoSaldo.toLocaleString('es-CL'));
            document.querySelector('.modal-overlay').remove();
            
            // Actualizar UI
            this.actualizarSaldoUI();
        } else {
            alert('❌ ' + result.message);
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check"></i> Confirmar Depósito';
        }
    }

    /**
     * Procesar retiro
     */
    async procesarRetiro() {
        const monto = document.getElementById('montoRetiro').value;
        const btn = event.target;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        
        const result = await this.withdraw(monto);
        
        if (result.success) {
            alert('✅ ' + result.message + '\nNuevo saldo: $' + result.nuevoSaldo.toLocaleString('es-CL'));
            document.querySelector('.modal-overlay').remove();
            
            // Actualizar UI
            this.actualizarSaldoUI();
        } else {
            alert('❌ ' + result.message);
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check"></i> Confirmar Retiro';
        }
    }

    /**
     * Actualizar saldo en la UI
     */
    actualizarSaldoUI() {
        const elementos = document.querySelectorAll('.user-saldo, .saldo-wallet');
        elementos.forEach(el => {
            el.textContent = '$' + this.saldoActual.toLocaleString('es-CL');
        });
    }

    /**
     * Renderizar transacciones
     */
    renderTransacciones(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!this.transacciones || this.transacciones.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #999;">
                    <i class="fas fa-receipt fa-2x" style="margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>No hay transacciones</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.transacciones.map(t => this.createTransaccionRow(t)).join('');
    }

    /**
     * Crear fila de transacción
     */
    createTransaccionRow(transaccion) {
        const esPositivo = ['deposito', 'puja_ganada', 'venta'].includes(transaccion.tipo);
        const icono = this.getIconoTransaccion(transaccion.tipo);
        const color = esPositivo ? '#27ae60' : '#e74c3c';
        const signo = esPositivo ? '+' : '-';
        
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #eee;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: ${color}20; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-${icono}" style="color: ${color};"></i>
                    </div>
                    <div>
                        <div style="font-weight: 600;">${this.getTituloTransaccion(transaccion.tipo)}</div>
                        <small style="color: #999;">${new Date(transaccion.createdAt).toLocaleString('es-CL')}</small>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.1rem; font-weight: bold; color: ${color};">
                        ${signo}$${parseFloat(transaccion.monto).toLocaleString('es-CL')}
                    </div>
                    <small style="color: #999;">${transaccion.estado}</small>
                </div>
            </div>
        `;
    }

    getIconoTransaccion(tipo) {
        const iconos = {
            'deposito': 'plus-circle',
            'retiro': 'minus-circle',
            'puja': 'gavel',
            'puja_ganada': 'trophy',
            'compra': 'shopping-cart',
            'venta': 'dollar-sign',
            'donacion': 'heart'
        };
        return iconos[tipo] || 'exchange-alt';
    }

    getTituloTransaccion(tipo) {
        const titulos = {
            'deposito': 'Depósito',
            'retiro': 'Retiro',
            'puja': 'Puja en subasta',
            'puja_ganada': 'Subasta ganada',
            'compra': 'Compra de producto',
            'venta': 'Venta realizada',
            'donacion': 'Donación'
        };
        return titulos[tipo] || 'Transacción';
    }
}

// Instancia global
const walletManager = new WalletManager();
