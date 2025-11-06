/**
 * Sistema de Pagos con Mercado Pago - Modo Sandbox
 * Integración con la API de Mercado Pago para transacciones simuladas
 * NO MANEJA DINERO REAL - Solo para testing y desarrollo
 */

const MercadoPagoPayment = {
    // Configuración Sandbox (Modo de prueba)
    // IMPORTANTE: Credenciales de prueba de Mercado Pago Chile
    publicKey: 'APP_USR-54e8b27e-5ac8-457d-9e4d-763e2249a9bb', // Tu Public Key de Checkout Pro actualizada
    backendUrl: 'http://localhost:3000', // URL del backend
    
    initialized: false,

    /**
     * Inicializar el SDK de Mercado Pago
     */
    async init() {
        if (this.initialized) return;

        // Cargar el SDK de Mercado Pago
        if (!window.MercadoPago) {
            await this.loadSDK();
        }

        try {
            // Inicializar Mercado Pago con la clave pública
            window.mp = new MercadoPago(this.publicKey);
            this.initialized = true;
            console.log('✅ Mercado Pago inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar Mercado Pago:', error);
            notify.error('Error al inicializar sistema de pagos');
        }
    },

    /**
     * Cargar el SDK de Mercado Pago dinámicamente
     */
    loadSDK() {
        return new Promise((resolve, reject) => {
            if (document.querySelector('script[src*="mercadopago"]')) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://sdk.mercadopago.com/js/v2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    /**
     * Crear preferencia de pago para subastas, rifas o productos
     * @param {Object} params - Parámetros del pago
     * @returns {Object} Preferencia de pago
     */
    async crearPreferencia(params) {
        const {
            tipo,           // 'subasta', 'rifa', 'producto'
            titulo,
            descripcion,
            monto,
            cantidad = 1,
            itemId,
            empresaId,
            compradorEmail,
            compradorNombre
        } = params;

        // En producción, esto se haría en el backend
        // Por ahora simulamos la creación de preferencia
        const preferencia = {
            items: [{
                id: itemId,
                title: titulo,
                description: descripcion,
                quantity: cantidad,
                unit_price: monto,
                currency_id: 'CLP'
            }],
            payer: {
                name: compradorNombre,
                email: compradorEmail
            },
            back_urls: {
                success: window.location.origin + '/pago-exitoso.html',
                failure: window.location.origin + '/pago-fallido.html',
                pending: window.location.origin + '/pago-pendiente.html'
            },
            auto_return: 'approved',
            metadata: {
                tipo: tipo,
                itemId: itemId,
                empresaId: empresaId,
                timestamp: new Date().toISOString()
            }
        };

        return preferencia;
    },

    /**
     * Procesar pago de subasta (puja)
     */
    async procesarPagoSubasta(subastaId, montoPuja) {
        await this.init();

        const session = auth.getSession();
        if (!session) {
            notify.error('Debes iniciar sesión para pujar');
            return null;
        }

        const subastas = JSON.parse(localStorage.getItem('nexos_subastas') || '[]');
        const subasta = subastas.find(s => s.id === subastaId);

        if (!subasta) {
            notify.error('Subasta no encontrada');
            return null;
        }

        try {
            // Crear preferencia de pago
            const preferencia = await this.crearPreferencia({
                tipo: 'subasta',
                titulo: `Puja: ${subasta.titulo}`,
                descripcion: `Puja de $${montoPuja.toLocaleString('es-CL')} en ${subasta.titulo}`,
                monto: montoPuja,
                itemId: subastaId,
                empresaId: subasta.empresaId,
                compradorEmail: session.email,
                compradorNombre: session.nombre
            });

            // Simular pago en sandbox
            return await this.simularPagoSandbox(preferencia, 'subasta', subastaId, montoPuja);

        } catch (error) {
            console.error('Error al procesar pago de subasta:', error);
            notify.error('Error al procesar el pago');
            return null;
        }
    },

    /**
     * Procesar pago de boletos de rifa
     */
    async procesarPagoRifa(rifaId, boletos) {
        await this.init();

        const session = auth.getSession();
        if (!session) {
            notify.error('Debes iniciar sesión para comprar boletos');
            return null;
        }

        const rifas = JSON.parse(localStorage.getItem('nexos_rifas') || '[]');
        const rifa = rifas.find(r => r.id === rifaId);

        if (!rifa) {
            notify.error('Rifa no encontrada');
            return null;
        }

        const montoTotal = boletos.length * rifa.precioBoleto;

        try {
            const preferencia = await this.crearPreferencia({
                tipo: 'rifa',
                titulo: `Boletos: ${rifa.titulo}`,
                descripcion: `${boletos.length} boleto(s) para ${rifa.titulo}`,
                monto: rifa.precioBoleto,
                cantidad: boletos.length,
                itemId: rifaId,
                empresaId: rifa.empresaId,
                compradorEmail: session.email,
                compradorNombre: session.nombre
            });

            return await this.simularPagoSandbox(preferencia, 'rifa', rifaId, montoTotal, boletos);

        } catch (error) {
            console.error('Error al procesar pago de rifa:', error);
            notify.error('Error al procesar el pago');
            return null;
        }
    },

    /**
     * Procesar pago de producto
     */
    async procesarPagoProducto(productoId, cantidad) {
        await this.init();

        const session = auth.getSession();
        if (!session) {
            notify.error('Debes iniciar sesión para comprar');
            return null;
        }

        const productos = JSON.parse(localStorage.getItem('nexos_productos') || '[]');
        const producto = productos.find(p => p.id === productoId);

        if (!producto) {
            notify.error('Producto no encontrado');
            return null;
        }

        const montoTotal = producto.precio * cantidad;

        try {
            const preferencia = await this.crearPreferencia({
                tipo: 'producto',
                titulo: producto.nombre,
                descripcion: producto.descripcion,
                monto: producto.precio,
                cantidad: cantidad,
                itemId: productoId,
                empresaId: producto.empresaId,
                compradorEmail: session.email,
                compradorNombre: session.nombre
            });

            return await this.simularPagoSandbox(preferencia, 'producto', productoId, montoTotal, cantidad);

        } catch (error) {
            console.error('Error al procesar pago de producto:', error);
            notify.error('Error al procesar el pago');
            return null;
        }
    },

    /**
     * Crear preferencia de pago y obtener link de pago
     * En sandbox, esto simula la creación de preferencia
     * En producción, esto debe hacerse en el backend
     */
    async crearPreferenciaReal(preferencia) {
        try {
            console.log('🔄 Creando preferencia de pago en Mercado Pago REAL...');
            console.log('🌐 Backend URL:', this.backendUrl);
            
            // Verificar conexión con backend
            try {
                const healthCheck = await fetch(`${this.backendUrl}/api/health`, { 
                    method: 'GET',
                    signal: AbortSignal.timeout(3000) // 3 segundos timeout
                });
                if (!healthCheck.ok) {
                    throw new Error('Backend no está respondiendo');
                }
                console.log('✅ Backend conectado correctamente');
            } catch (healthError) {
                console.error('❌ Backend no está accesible:', healthError);
                throw new Error('No se puede conectar con el servidor de pagos. Asegúrate de que el backend esté corriendo en http://localhost:3000');
            }
            
            // Extraer datos del objeto preferencia
            const item = preferencia.items[0];
            const metadata = preferencia.metadata || {};
            
            const requestData = {
                tipo: metadata.tipo || 'compra',
                itemId: item.id,
                monto: item.unit_price,
                cantidad: item.quantity || 1,
                titulo: item.title,
                descripcion: item.description || '',
                metadata: metadata
            };
            
            console.log('📤 Enviando datos al backend:', requestData);
            
            const response = await fetch(`${this.backendUrl}/api/create-preference`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                console.error('❌ Error del backend:', errorData);
                throw new Error(errorData.error || 'Error al crear preferencia');
            }

            const data = await response.json();
            
            console.log('✅ Preferencia creada exitosamente');
            console.log('📋 ID de preferencia:', data.preferenceId);
            console.log('🔗 Sandbox URL:', data.sandboxInitPoint);
            
            if (!data.sandboxInitPoint) {
                throw new Error('El backend no devolvió la URL de Checkout Pro');
            }
            
            return {
                id: data.preferenceId,
                init_point: data.initPoint,
                sandbox_init_point: data.sandboxInitPoint
            };
            
        } catch (error) {
            console.error('❌ Error al crear preferencia:', error);
            
            // Mensaje específico según el error
            if (error.message.includes('Backend no está accesible') || error.message.includes('Failed to fetch')) {
                notify.error('❌ Backend no disponible. Inicia el servidor con: cd backend && node server.js');
            } else {
                notify.error(`❌ Error: ${error.message}`);
            }
            
            throw error;
        }
    },

    /**
     * Redirigir a Checkout Pro (Página Externa de Mercado Pago)
     * Opción 1: Redirección completa a página de Mercado Pago
     */
    async pagarConCheckoutPro(preferencia, tipo, itemId, monto, extra = null) {
        try {
            notify.info('Conectando con Mercado Pago...');
            
            // Guardar información del pago en localStorage para recuperar después
            const pagoInfo = {
                tipo: tipo,
                itemId: itemId,
                monto: monto,
                extra: extra,
                preferencia: preferencia,
                fecha: new Date().toISOString()
            };
            
            localStorage.setItem('nexos_pago_pendiente', JSON.stringify(pagoInfo));

            // Crear preferencia (en producción esto va al backend)
            console.log('🔄 Creando preferencia para Checkout Pro...');
            const preferenciaCreada = await this.crearPreferenciaReal(preferencia);
            
            if (!preferenciaCreada || !preferenciaCreada.sandbox_init_point) {
                throw new Error('No se obtuvo la URL de redirección');
            }

            console.log('✅ URL de Checkout Pro obtenida:', preferenciaCreada.sandbox_init_point);
            
            // Mostrar mensaje antes de redirigir
            notify.success('Redirigiendo a Mercado Pago...');
            
            // Esperar un momento para que el usuario vea el mensaje
            await this.delay(500);

            // Redirigir en la misma ventana
            console.log('🚀 Redirigiendo a:', preferenciaCreada.sandbox_init_point);
            window.location.href = preferenciaCreada.sandbox_init_point;

        } catch (error) {
            console.error('❌ Error al crear preferencia para Checkout Pro:', error);
            notify.error('Error al conectar con Mercado Pago. Intenta con Modo Sandbox.');
            return null;
        }
    },

    /**
     * Simular pago en sandbox (para desarrollo sin dinero real)
     * En producción, esto se reemplaza con la integración real de Mercado Pago
     */
    async simularPagoSandbox(preferencia, tipo, itemId, monto, extra = null) {
        return new Promise((resolve) => {
            // Mostrar modal con opciones: Sandbox o Checkout Real
            const modal = this.crearModalOpcionesPago(preferencia, tipo, itemId, monto, extra);
            
            // Opción 1: Sandbox Simulado (sin redirección)
            modal.querySelector('#btn-pago-sandbox').onclick = async () => {
                modal.remove();
                
                // Mostrar modal de simulación
                const modalSimulacion = this.crearModalPagoSandbox(preferencia, monto);
                
                // Manejar aprobación
                modalSimulacion.querySelector('#btn-aprobar-pago').onclick = async () => {
                    modalSimulacion.remove();
                    
                    // Simular delay de procesamiento
                    notify.info('Procesando pago...');
                    await this.delay(2000);

                    // Generar ID de transacción simulado
                    const transactionId = 'MP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

                    // Procesar según tipo
                    let resultado = null;
                    if (tipo === 'subasta') {
                        resultado = await this.procesarPagoSubastaAprobado(itemId, monto, transactionId);
                    } else if (tipo === 'rifa') {
                        resultado = await this.procesarPagoRifaAprobado(itemId, monto, extra, transactionId);
                    } else if (tipo === 'producto') {
                        resultado = await this.procesarPagoProductoAprobado(itemId, monto, extra, transactionId);
                    } else if (tipo === 'deposito') {
                        resultado = await this.procesarDepositoAprobado(monto, transactionId);
                    }

                    notify.success('¡Pago aprobado exitosamente! 🎉');
                    resolve({
                        success: true,
                        transactionId: transactionId,
                        amount: monto,
                        status: 'approved',
                        ...resultado
                    });
                };

                // Manejar rechazo
                modalSimulacion.querySelector('#btn-rechazar-pago').onclick = () => {
                    modalSimulacion.remove();
                    notify.error('Pago rechazado');
                    resolve({
                        success: false,
                        status: 'rejected'
                    });
                };
            };

            // Opción 2: Checkout Pro (con redirección)
            modal.querySelector('#btn-checkout-pro').onclick = () => {
                modal.remove();
                this.pagarConCheckoutPro(preferencia, tipo, itemId, monto, extra);
                // No resolver aquí, la página se va a recargar después del pago
            };

            // Cancelar
            modal.querySelector('#btn-cancelar-opciones').onclick = () => {
                modal.remove();
                resolve({
                    success: false,
                    status: 'cancelled'
                });
            };
        });
    },

    /**
     * Crear modal de opciones de pago
     */
    crearModalOpcionesPago(preferencia, tipo, itemId, monto, extra) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 20px; padding: 2.5rem; max-width: 550px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #009ee3, #0082c3); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center;">
                        <i class="fab fa-cc-mastercard" style="font-size: 3rem; color: white;"></i>
                    </div>
                    <h2 style="margin: 0 0 0.5rem 0; color: #333;">Selecciona Método de Pago</h2>
                    <p style="color: #666; font-size: 0.9rem; margin: 0;">Total: <strong style="color: #009ee3; font-size: 1.3rem;">$${monto.toLocaleString('es-CL')}</strong></p>
                </div>

                <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
                    <button id="btn-checkout-pro" style="background: linear-gradient(135deg, #009ee3, #0082c3); color: white; border: none; padding: 1.2rem; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.8rem; transition: all 0.3s;">
                        <i class="fas fa-external-link-alt"></i>
                        <div style="text-align: left;">
                            <div>Pagar con Mercado Pago</div>
                            <div style="font-size: 0.8rem; font-weight: 400; opacity: 0.9;">Redirige a página segura de pago</div>
                        </div>
                    </button>

                    <button id="btn-pago-sandbox" style="background: #f8f9fa; color: #333; border: 2px solid #dee2e6; padding: 1.2rem; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.8rem; transition: all 0.3s;">
                        <i class="fas fa-vial"></i>
                        <div style="text-align: left;">
                            <div>Modo Sandbox (Desarrollo)</div>
                            <div style="font-size: 0.8rem; font-weight: 400; opacity: 0.7;">Simulación rápida sin redirección</div>
                        </div>
                    </button>
                </div>

                <button id="btn-cancelar-opciones" style="width: 100%; padding: 0.8rem; background: transparent; color: #666; border: none; cursor: pointer; font-size: 0.95rem;">
                    Cancelar
                </button>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    },

    /**
     * Crear modal de simulación de pago (Sandbox)
     */
    crearModalPagoSandbox(preferencia, monto) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 20px; padding: 3rem; max-width: 500px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #009ee3, #0082c3); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center;">
                        <i class="fab fa-cc-mastercard" style="font-size: 3rem; color: white;"></i>
                    </div>
                    <h2 style="margin: 0 0 0.5rem 0; color: #333;">Mercado Pago</h2>
                    <p style="color: #666; font-size: 0.9rem; margin: 0;">Modo Sandbox - Sin dinero real</p>
                </div>

                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                        <span style="color: #666;">Producto:</span>
                        <span style="font-weight: 600; color: #333;">${preferencia.items[0].title}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                        <span style="color: #666;">Cantidad:</span>
                        <span style="font-weight: 600; color: #333;">${preferencia.items[0].quantity}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-top: 1rem; border-top: 2px solid #dee2e6;">
                        <span style="color: #666; font-size: 1.1rem;">Total a pagar:</span>
                        <span style="font-weight: 700; color: #009ee3; font-size: 1.5rem;">$${monto.toLocaleString('es-CL')}</span>
                    </div>
                </div>

                <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 1rem; margin-bottom: 2rem;">
                    <p style="margin: 0; color: #856404; font-size: 0.9rem; text-align: center;">
                        <i class="fas fa-exclamation-triangle"></i> Simulación de pago - No se procesará dinero real
                    </p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <button id="btn-rechazar-pago" style="padding: 1rem; background: #e74c3c; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 1rem; transition: all 0.3s;">
                        <i class="fas fa-times"></i> Rechazar
                    </button>
                    <button id="btn-aprobar-pago" style="padding: 1rem; background: linear-gradient(135deg, #27ae60, #229954); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 1rem; transition: all 0.3s;">
                        <i class="fas fa-check"></i> Aprobar Pago
                    </button>
                </div>

                <p style="text-align: center; margin: 1.5rem 0 0 0; font-size: 0.85rem; color: #999;">
                    Tarjetas de prueba: 4509 9535 6623 3704 (Aprobada)
                </p>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    },

    /**
     * Procesar pago de subasta aprobado
     */
    async procesarPagoSubastaAprobado(subastaId, monto, transactionId) {
        const session = auth.getSession();
        const subastas = JSON.parse(localStorage.getItem('nexos_subastas') || '[]');
        const index = subastas.findIndex(s => s.id === subastaId);

        if (index === -1) return null;

        const subasta = subastas[index];

        // Registrar puja
        if (!subasta.pujas) subasta.pujas = [];
        subasta.pujas.push({
            usuario: session.email,
            monto: monto,
            fecha: new Date().toISOString(),
            transactionId: transactionId
        });

        subasta.precioActual = monto;
        subastas[index] = subasta;
        localStorage.setItem('nexos_subastas', JSON.stringify(subastas));

        // Registrar transacción
        this.registrarTransaccion({
            tipo: 'puja',
            itemId: subastaId,
            monto: monto,
            transactionId: transactionId,
            usuario: session.email
        });

        return { subasta };
    },

    /**
     * Procesar pago de rifa aprobado
     */
    async procesarPagoRifaAprobado(rifaId, monto, boletos, transactionId) {
        const session = auth.getSession();
        const rifas = JSON.parse(localStorage.getItem('nexos_rifas') || '[]');
        const index = rifas.findIndex(r => r.id === rifaId);

        if (index === -1) return null;

        const rifa = rifas[index];

        // Marcar boletos como vendidos
        boletos.forEach(numBoleto => {
            const boletoIndex = rifa.boletos.findIndex(b => b.numero === numBoleto);
            if (boletoIndex !== -1) {
                rifa.boletos[boletoIndex].vendido = true;
                rifa.boletos[boletoIndex].comprador = session.email;
                rifa.boletos[boletoIndex].fecha = new Date().toISOString();
                rifa.boletos[boletoIndex].transactionId = transactionId;
            }
        });

        rifas[index] = rifa;
        localStorage.setItem('nexos_rifas', JSON.stringify(rifas));

        // Transferir dinero a la empresa
        const empresas = JSON.parse(localStorage.getItem('nexos_empresas') || '[]');
        const empIndex = empresas.findIndex(e => e.id === rifa.empresaId);
        if (empIndex !== -1) {
            empresas[empIndex].saldo = (empresas[empIndex].saldo || 0) + monto;
            localStorage.setItem('nexos_empresas', JSON.stringify(empresas));
        }

        // Registrar transacción
        this.registrarTransaccion({
            tipo: 'rifa',
            itemId: rifaId,
            monto: monto,
            transactionId: transactionId,
            usuario: session.email,
            boletos: boletos
        });

        return { rifa, boletos };
    },

    /**
     * Procesar pago de producto aprobado
     */
    async procesarPagoProductoAprobado(productoId, monto, cantidad, transactionId) {
        const session = auth.getSession();
        const productos = JSON.parse(localStorage.getItem('nexos_productos') || '[]');
        const index = productos.findIndex(p => p.id === productoId);

        if (index === -1) return null;

        const producto = productos[index];

        // Reducir stock
        producto.stock -= cantidad;
        productos[index] = producto;
        localStorage.setItem('nexos_productos', JSON.stringify(productos));

        // Transferir dinero a la empresa
        const empresas = JSON.parse(localStorage.getItem('nexos_empresas') || '[]');
        const empIndex = empresas.findIndex(e => e.id === producto.empresaId);
        if (empIndex !== -1) {
            empresas[empIndex].saldo = (empresas[empIndex].saldo || 0) + monto;
            localStorage.setItem('nexos_empresas', JSON.stringify(empresas));
        }

        // Registrar transacción
        this.registrarTransaccion({
            tipo: 'producto',
            itemId: productoId,
            monto: monto,
            transactionId: transactionId,
            usuario: session.email,
            cantidad: cantidad
        });

        return { producto, cantidad };
    },

    /**
     * Registrar transacción en el historial
     */
    registrarTransaccion(data) {
        const transacciones = JSON.parse(localStorage.getItem('nexos_transacciones') || '[]');
        transacciones.push({
            ...data,
            fecha: new Date().toISOString(),
            metodo: 'mercadopago',
            status: 'approved'
        });
        localStorage.setItem('nexos_transacciones', JSON.stringify(transacciones));
    },

    /**
     * Procesar depósito de dinero a billetera de usuario
     */
    async procesarDeposito(monto) {
        await this.init();

        const session = auth.getSession();
        if (!session) {
            notify.error('Debes iniciar sesión');
            return null;
        }

        if (monto < 1000) {
            notify.error('El monto mínimo es $1.000');
            return null;
        }

        try {
            const preferencia = await this.crearPreferencia({
                tipo: 'deposito',
                titulo: 'Recarga de Billetera Nexos',
                descripcion: `Depósito de $${monto.toLocaleString('es-CL')} a billetera digital`,
                monto: monto,
                cantidad: 1,
                itemId: 'deposito-' + Date.now(),
                empresaId: null,
                compradorEmail: session.email,
                compradorNombre: session.nombre || session.username
            });

            return await this.simularPagoSandbox(preferencia, 'deposito', null, monto);

        } catch (error) {
            console.error('Error al procesar depósito:', error);
            notify.error('Error al procesar el depósito');
            return null;
        }
    },

    /**
     * Procesar depósito aprobado
     */
    async procesarDepositoAprobado(monto, transactionId) {
        const session = auth.getSession();
        const usuarios = JSON.parse(localStorage.getItem('nexos_users') || '[]');
        const index = usuarios.findIndex(u => u.id === session.id || u.username === session.username);

        if (index === -1) {
            notify.error('Usuario no encontrado');
            return null;
        }

        const usuario = usuarios[index];

        // Actualizar saldo
        usuario.saldo = (usuario.saldo || 0) + monto;

        // Registrar transacción en el usuario
        if (!usuario.transacciones) usuario.transacciones = [];
        usuario.transacciones.push({
            id: transactionId,
            ticketId: transactionId,
            tipo: 'ingreso',
            concepto: 'Depósito a billetera',
            monto: monto,
            fecha: new Date().toISOString(),
            metodo: 'mercadopago'
        });

        usuarios[index] = usuario;
        localStorage.setItem('nexos_users', JSON.stringify(usuarios));

        // Actualizar sesión
        auth.updateSession(usuario);

        // Registrar transacción global
        this.registrarTransaccion({
            tipo: 'deposito',
            itemId: null,
            monto: monto,
            transactionId: transactionId,
            usuario: session.email
        });

        return { usuario, saldoNuevo: usuario.saldo };
    },

    /**
     * Utilidad para simular delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Hacer disponible globalmente
window.MercadoPagoPayment = MercadoPagoPayment;
