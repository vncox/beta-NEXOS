// Manager para detalle de subasta
class DetalleSubastaManager {
    constructor() {
        this.apiClient = new APIClient();
        this.subastasManager = new SubastasManager();
        this.subastaActual = null;
        this.intervaloCuenta = null;
        this.intervaloActualizacion = null;
    }

    // Obtener ID de la URL
    getSubastaIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Cargar subasta
    async cargarSubasta() {
        const id = this.getSubastaIdFromURL();
        if (!id) {
            notify.error('No se especificó una subasta');
            setTimeout(() => window.location.href = 'subastas.html', 2000);
            return;
        }

        console.log('Cargando subasta con ID:', id);

        const result = await this.subastasManager.getSubastaById(id);
        console.log('Resultado de getSubastaById:', result);
        
        if (!result.success) {
            notify.error('Subasta no encontrada');
            setTimeout(() => window.location.href = 'subastas.html', 2000);
            return;
        }

        this.subastaActual = result.subasta;
        console.log('Subasta actual:', this.subastaActual);
        
        this.mostrarSubasta();
        await this.cargarPujas();
        await this.cargarParticipantes();
        this.iniciarContadorTiempo();
        this.iniciarActualizacionAutomatica();
    }

    // Mostrar datos de la subasta
    mostrarSubasta() {
        const subasta = this.subastaActual;
        console.log('Mostrando subasta:', subasta);

        // Breadcrumb
        const breadcrumbTitulo = document.getElementById('breadcrumb-titulo');
        if (breadcrumbTitulo) {
            breadcrumbTitulo.textContent = subasta.titulo;
        }

        // Título principal
        const tituloElement = document.getElementById('subasta-titulo');
        if (tituloElement) {
            tituloElement.textContent = subasta.titulo;
        }

        // Descripción
        const descripcionElement = document.getElementById('subasta-descripcion');
        if (descripcionElement) {
            descripcionElement.textContent = subasta.descripcion;
        }

        // Imagen principal
        const imagenElement = document.getElementById('subasta-imagen');
        if (imagenElement) {
            const imagenUrl = subasta.imagen || 'images/placeholder.png';
            imagenElement.src = imagenUrl;
            imagenElement.alt = subasta.titulo;
        }

        // Empresa
        const empresaElement = document.getElementById('empresa-nombre');
        if (empresaElement) {
            const nombreEmpresa = subasta.empresa?.razon_social || 
                                 subasta.Empresa?.razon_social || 
                                 subasta.Empresa?.nombre_empresa || 
                                 'Empresa Demo';
            empresaElement.textContent = nombreEmpresa;
        }

        // Tipo de subasta
        const tipoTexto = document.getElementById('tipo-texto');
        if (tipoTexto) {
            const tipos = {
                'producto': 'Producto',
                'servicio': 'Servicio',
                'experiencia': 'Experiencia'
            };
            tipoTexto.textContent = tipos[subasta.tipo] || 'Subasta';
        }

        // Precios
        const precioActualElement = document.getElementById('precio-actual');
        if (precioActualElement) {
            precioActualElement.textContent = '$' + (subasta.precio_actual || subasta.precio_inicial || 0).toLocaleString('es-CL');
        }

        const precioInicialElement = document.getElementById('precio-inicial');
        if (precioInicialElement) {
            precioInicialElement.textContent = '$' + (subasta.precio_inicial || 0).toLocaleString('es-CL');
        }

        // Incremento mínimo
        const incrementoElement = document.getElementById('incremento-minimo');
        if (incrementoElement) {
            incrementoElement.textContent = (subasta.incremento_minimo || 1000).toLocaleString('es-CL');
        }

        // Detalles de la subasta
        const fechaInicioElement = document.getElementById('fecha-inicio');
        if (fechaInicioElement) {
            fechaInicioElement.textContent = subasta.fecha_inicio 
                ? new Date(subasta.fecha_inicio).toLocaleString('es-CL')
                : '-';
        }

        const fechaFinElement = document.getElementById('fecha-fin');
        if (fechaFinElement) {
            fechaFinElement.textContent = subasta.fecha_fin 
                ? new Date(subasta.fecha_fin).toLocaleString('es-CL')
                : '-';
        }

        const totalPujasElement = document.getElementById('total-pujas');
        if (totalPujasElement) {
            totalPujasElement.textContent = subasta.cantidad_pujas || 0;
        }

        const estadoElement = document.getElementById('estado-subasta');
        if (estadoElement) {
            estadoElement.textContent = this.getEstadoLabel(subasta.estado);
        }

        // Ganador si existe
        if (subasta.estado === 'finalizada' && subasta.ganador_id) {
            const ganadorRow = document.getElementById('ganador-row');
            if (ganadorRow) {
                ganadorRow.style.display = 'flex';
                const ganadorElement = document.getElementById('ganador-subasta');
                if (ganadorElement) {
                    ganadorElement.textContent = subasta.ganador?.nombre || 'Ganador';
                }
            }
        }

        // Cargar saldo del usuario si está logueado
        this.cargarSaldoUsuario();
    }

    // Cargar saldo del usuario
    async cargarSaldoUsuario() {
        if (!auth || !auth.isLoggedIn || !auth.isLoggedIn()) {
            return;
        }

        try {
            const saldo = await walletManager.getSaldo();
            const saldoDisplay = document.getElementById('saldo-usuario-display');
            if (saldoDisplay && saldo !== null) {
                saldoDisplay.textContent = '$' + saldo.toLocaleString('es-CL');
            }
        } catch (error) {
            console.error('Error al cargar saldo:', error);
        }
    }

    // Cargar pujas
    async cargarPujas() {
        console.log('Cargando pujas para subasta:', this.subastaActual.id);
        const result = await this.subastasManager.getPujasBySubasta(this.subastaActual.id);
        console.log('Resultado de getPujasBySubasta:', result);
        
        if (result.success) {
            this.renderizarPujas(result.pujas || []);
        } else {
            console.error('Error al cargar pujas:', result.message);
            this.renderizarPujas([]);
        }
    }

    // Cargar participantes
    async cargarParticipantes() {
        console.log('Cargando participantes para subasta:', this.subastaActual.id);
        const result = await this.subastasManager.getPujasBySubasta(this.subastaActual.id);
        
        if (result.success && result.pujas) {
            // Obtener usuarios únicos
            const usuariosUnicos = new Map();
            result.pujas.forEach(puja => {
                if (puja.User && !usuariosUnicos.has(puja.usuario_id)) {
                    usuariosUnicos.set(puja.usuario_id, puja.User);
                }
            });

            const participantes = Array.from(usuariosUnicos.values());
            this.renderizarParticipantes(participantes);

            // Actualizar contador
            const numParticipantes = document.getElementById('num-participantes');
            if (numParticipantes) {
                numParticipantes.textContent = participantes.length;
            }

            const totalParticipantes = document.getElementById('total-participantes');
            if (totalParticipantes) {
                totalParticipantes.textContent = participantes.length;
            }
        } else {
            this.renderizarParticipantes([]);
        }
    }

    // Renderizar pujas
    renderizarPujas(pujas) {
        const container = document.getElementById('lista-pujas');
        if (!container) {
            console.error('No se encontró el contenedor de pujas');
            return;
        }

        console.log('Renderizando', pujas.length, 'pujas');

        if (!pujas || pujas.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #999;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>Aún no hay pujas en esta subasta</p>
                    <p style="font-size: 0.9rem;">¡Sé el primero en pujar!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = pujas.map((puja, index) => {
            const usuario = puja.User || puja.usuario || {};
            const nombre = usuario.nombre || usuario.username || 'Usuario';
            const inicial = nombre.charAt(0).toUpperCase();
            const fecha = new Date(puja.createdAt || puja.fecha_puja).toLocaleString('es-CL');
            const monto = parseFloat(puja.monto || 0);

            return `
                <div class="puja-item ${index === 0 ? 'puja-ganadora' : ''}" style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem;
                    border-bottom: 1px solid #eee;
                    background: ${index === 0 ? 'linear-gradient(135deg, #fff9e6 0%, #fff 100%)' : 'white'};
                ">
                    <div class="puja-usuario" style="display: flex; align-items: center; gap: 1rem;">
                        <div class="avatar" style="
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: 700;
                            font-size: 1.1rem;
                        ">${inicial}</div>
                        <div class="puja-info">
                            <div class="nombre" style="font-weight: 600; color: #333;">${nombre}</div>
                            <div class="fecha" style="font-size: 0.85rem; color: #999;">${fecha}</div>
                        </div>
                    </div>
                    <div class="puja-monto" style="text-align: right;">
                        <div style="font-size: 1.3rem; font-weight: 700; color: #667eea;">
                            $${monto.toLocaleString('es-CL')}
                        </div>
                        ${index === 0 ? '<div style="color: #f39c12; font-size: 0.85rem; font-weight: 600;">🏆 Ganando</div>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Renderizar participantes
    renderizarParticipantes(participantes) {
        const container = document.getElementById('lista-participantes');
        if (!container) {
            console.error('No se encontró el contenedor de participantes');
            return;
        }

        console.log('Renderizando', participantes.length, 'participantes');

        if (!participantes || participantes.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 1.5rem; color: #999; font-size: 0.9rem;">
                    Sin participantes aún
                </div>
            `;
            return;
        }

        container.innerHTML = participantes.map(usuario => {
            const nombre = usuario.nombre || usuario.username || 'Usuario';
            const inicial = nombre.charAt(0).toUpperCase();

            return `
                <div class="participante-item" style="
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    padding: 0.8rem;
                    border-bottom: 1px solid #f0f0f0;
                ">
                    <div class="avatar" style="
                        width: 35px;
                        height: 35px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                        color: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 600;
                        font-size: 0.95rem;
                    ">${inicial}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #333; font-size: 0.95rem;">${nombre}</div>
                        <div style="font-size: 0.8rem; color: #999;">Participante</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Realizar puja
    async realizarPuja() {
        if (!auth || !auth.isLoggedIn || !auth.isLoggedIn()) {
            notify.warning('Debes iniciar sesión para pujar');
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }

        const montoInput = document.getElementById('monto-puja');
        if (!montoInput) return;

        const monto = parseInt(montoInput.value);
        const minimo = this.subastaActual.precio_actual + (this.subastaActual.incremento_minimo || 1000);

        if (!monto || monto < minimo) {
            notify.error(`El monto mínimo es $${minimo.toLocaleString('es-CL')}`);
            return;
        }

        // Confirmar
        if (!confirm(`¿Confirmas tu puja de $${monto.toLocaleString('es-CL')}?`)) {
            return;
        }

        // Realizar puja
        const result = await this.subastasManager.crearPuja(this.subastaActual.id, monto);

        if (result.success) {
            notify.success('¡Puja realizada exitosamente! 🎉');
            montoInput.value = '';
            
            // Recargar subasta y pujas
            await this.cargarSubasta();
        } else {
            notify.error(result.message || 'Error al realizar la puja');
        }
    }

    // Aplicar incremento rápido
    aplicarIncremento(incremento) {
        const montoInput = document.getElementById('monto-puja');
        if (!montoInput || !this.subastaActual) return;

        const nuevoMonto = this.subastaActual.precio_actual + incremento;
        montoInput.value = nuevoMonto;
    }

    // Iniciar contador de tiempo
    iniciarContadorTiempo() {
        this.detenerContadorTiempo();

        this.intervaloCuenta = setInterval(() => {
            const ahora = new Date();
            const fechaFin = new Date(this.subastaActual.fecha_fin);
            const diff = fechaFin - ahora;

            if (diff <= 0) {
                this.mostrarSubastaFinalizada();
                this.detenerContadorTiempo();
                return;
            }

            const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
            const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((diff % (1000 * 60)) / 1000);

            this.actualizarContador({ dias, horas, minutos, segundos });
        }, 1000);
    }

    // Actualizar contador en UI
    actualizarContador(tiempo) {
        const elementos = {
            dias: document.getElementById('dias'),
            horas: document.getElementById('horas'),
            minutos: document.getElementById('minutos'),
            segundos: document.getElementById('segundos')
        };

        if (elementos.dias) elementos.dias.textContent = tiempo.dias;
        if (elementos.horas) elementos.horas.textContent = tiempo.horas.toString().padStart(2, '0');
        if (elementos.minutos) elementos.minutos.textContent = tiempo.minutos.toString().padStart(2, '0');
        if (elementos.segundos) elementos.segundos.textContent = tiempo.segundos.toString().padStart(2, '0');
    }

    // Detener contador
    detenerContadorTiempo() {
        if (this.intervaloCuenta) {
            clearInterval(this.intervaloCuenta);
            this.intervaloCuenta = null;
        }
    }

    // Iniciar actualización automática
    iniciarActualizacionAutomatica() {
        // Actualizar cada 10 segundos
        this.intervaloActualizacion = setInterval(async () => {
            await this.cargarSubasta();
        }, 10000);
    }

    // Detener actualización automática
    detenerActualizacionAutomatica() {
        if (this.intervaloActualizacion) {
            clearInterval(this.intervaloActualizacion);
            this.intervaloActualizacion = null;
        }
    }

    // Mostrar subasta finalizada
    mostrarSubastaFinalizada() {
        const contenedor = document.querySelector('.accion-pujar');
        if (contenedor) {
            contenedor.innerHTML = `
                <div class="subasta-finalizada">
                    <i class="fas fa-flag-checkered"></i>
                    <h3>Subasta Finalizada</h3>
                    <p>Esta subasta ha terminado</p>
                </div>
            `;
        }
    }

    // Obtener label de estado
    getEstadoLabel(estado) {
        const labels = {
            'activa': 'Activa',
            'finalizada': 'Finalizada',
            'cancelada': 'Cancelada',
            'pendiente': 'Pendiente'
        };
        return labels[estado] || estado;
    }

    // Cleanup
    destruir() {
        this.detenerContadorTiempo();
        this.detenerActualizacionAutomatica();
    }
}

// Crear instancia global
const detalleSubastaManager = new DetalleSubastaManager();

// Auto-inicializar cuando cargue la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        detalleSubastaManager.cargarSubasta();
    });
} else {
    detalleSubastaManager.cargarSubasta();
}

// Cleanup al salir
window.addEventListener('beforeunload', () => {
    detalleSubastaManager.destruir();
});
