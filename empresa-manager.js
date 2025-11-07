// Manager para perfil de empresa
class EmpresaManager {
    constructor() {
        this.apiClient = new APIClient();
        this.walletManager = new WalletManager();
    }

    // Cargar datos del perfil de empresa
    async cargarPerfil() {
        try {
            const response = await this.apiClient.getProfile();
            if (response.success && response.empresa) {
                this.renderPerfil(response.empresa);
                return { success: true, empresa: response.empresa };
            } else {
                console.error('Error al cargar perfil:', response.message);
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            return { success: false, message: error.message };
        }
    }

    // Renderizar perfil de empresa
    renderPerfil(empresa) {
        // Avatar con iniciales
        const avatarElement = document.getElementById('avatarInitials');
        if (avatarElement) {
            const nombreEmpresa = empresa.razon_social || empresa.nombre_empresa || empresa.username || 'E';
            const iniciales = nombreEmpresa.substring(0, 2).toUpperCase();
            
            if (empresa.profilePhoto) {
                avatarElement.innerHTML = `<img src="${empresa.profilePhoto}" alt="Foto de perfil">`;
            } else {
                avatarElement.innerHTML = `<span class="profile-avatar-text">${iniciales}</span>`;
            }
        }

        // Nombre de empresa
        const nombreElement = document.getElementById('empresaName');
        if (nombreElement) {
            nombreElement.textContent = empresa.razon_social || empresa.nombre_empresa || empresa.username || 'Empresa';
        }

        // RUT
        const rutElement = document.getElementById('empresaRut');
        if (rutElement) {
            rutElement.textContent = empresa.rut || empresa.username || '';
        }

        // Email
        const emailElement = document.getElementById('empresaEmail');
        if (emailElement) {
            emailElement.textContent = empresa.email || '';
        }

        // Teléfono
        const phoneElement = document.getElementById('empresaPhone');
        if (phoneElement) {
            phoneElement.textContent = empresa.telefono || 'No especificado';
        }

        // Fecha de registro
        const dateElement = document.getElementById('empresaDate');
        if (dateElement) {
            const fecha = new Date(empresa.fecha_registro || empresa.createdAt || Date.now());
            dateElement.textContent = fecha.getFullYear().toString();
        }

        // Estado de aprobación (si existe el elemento)
        const estadoElement = document.getElementById('estado-aprobacion');
        if (estadoElement) {
            const badge = this.getEstadoBadge(empresa.estado);
            estadoElement.innerHTML = badge;
        }

        // Llenar formulario de datos empresariales
        const formNombreEmpresa = document.getElementById('inputNombreEmpresa');
        const formRut = document.getElementById('inputRut');
        const formEmail = document.getElementById('inputEmail');
        const formTelefono = document.getElementById('inputTelefono');
        const formGiro = document.getElementById('inputGiro');
        const formSitioWeb = document.getElementById('inputSitioWeb');

        if (formNombreEmpresa) formNombreEmpresa.value = empresa.razon_social || empresa.nombre_empresa || '';
        if (formRut) formRut.value = empresa.rut || '';
        if (formEmail) formEmail.value = empresa.email || '';
        if (formTelefono) formTelefono.value = empresa.telefono || '';
        if (formGiro) formGiro.value = empresa.giro || '';
        if (formSitioWeb) formSitioWeb.value = empresa.sitio_web || '';

        // Dirección corporativa
        if (empresa.direccion) {
            const direccion = typeof empresa.direccion === 'string' ? JSON.parse(empresa.direccion) : empresa.direccion;
            const formDireccion = document.getElementById('inputDireccionEmpresa');
            const formComuna = document.getElementById('inputComunaEmpresa');
            const formCiudad = document.getElementById('inputCiudadEmpresa');
            const formRegion = document.getElementById('inputRegionEmpresa');
            const formCodigoPostal = document.getElementById('inputCodigoPostalEmpresa');

            if (formDireccion) formDireccion.value = direccion.direccion || '';
            if (formComuna) formComuna.value = direccion.comuna || '';
            if (formCiudad) formCiudad.value = direccion.ciudad || '';
            if (formRegion) formRegion.value = direccion.region || '';
            if (formCodigoPostal) formCodigoPostal.value = direccion.codigoPostal || '';
        }

        // Representante Legal
        if (empresa.representante_legal) {
            const rep = typeof empresa.representante_legal === 'string' ? JSON.parse(empresa.representante_legal) : empresa.representante_legal;
            const formNombreRep = document.getElementById('inputNombreRepresentante');
            const formRutRep = document.getElementById('inputRutRepresentante');
            const formEmailRep = document.getElementById('inputEmailRepresentante');
            const formTelefonoRep = document.getElementById('inputTelefonoRepresentante');
            const formCargoRep = document.getElementById('inputCargoRepresentante');

            if (formNombreRep) formNombreRep.value = rep.nombre || '';
            if (formRutRep) formRutRep.value = rep.rut || '';
            if (formEmailRep) formEmailRep.value = rep.email || '';
            if (formTelefonoRep) formTelefonoRep.value = rep.telefono || '';
            if (formCargoRep) formCargoRep.value = rep.cargo || '';
        }

        // Configuraciones (si existen)
        if (empresa.configuraciones) {
            const config = typeof empresa.configuraciones === 'string' ? JSON.parse(empresa.configuraciones) : empresa.configuraciones;
            
            const notif = document.getElementById('notificaciones');
            const emailNotif = document.getElementById('emailNotificaciones');
            const tema = document.getElementById('tema');
            const idioma = document.getElementById('idioma');

            if (notif) notif.checked = config.notificaciones || false;
            if (emailNotif) emailNotif.checked = config.emailNotificaciones || false;
            if (tema) tema.value = config.tema || 'claro';
            if (idioma) idioma.value = config.idioma || 'es';

            if (config.accesibilidad) {
                const altoContraste = document.getElementById('altoContraste');
                const tamañoTexto = document.getElementById('tamañoTexto');
                const animReducidas = document.getElementById('animacionesReducidas');

                if (altoContraste) altoContraste.checked = config.accesibilidad.altoContraste || false;
                if (tamañoTexto) tamañoTexto.value = config.accesibilidad.tamañoTexto || 'normal';
                if (animReducidas) animReducidas.checked = config.accesibilidad.animacionesReducidas || false;
            }
        }

        // Estadísticas
        this.actualizarEstadisticas(empresa);
    }

    // Badge de estado
    getEstadoBadge(estado) {
        const badges = {
            'aprobada': '<span class="badge badge-success"><i class="fas fa-check-circle"></i> Aprobada</span>',
            'pendiente': '<span class="badge badge-warning"><i class="fas fa-clock"></i> Pendiente de Aprobación</span>',
            'rechazada': '<span class="badge badge-danger"><i class="fas fa-times-circle"></i> Rechazada</span>'
        };
        return badges[estado] || '<span class="badge badge-secondary">Desconocido</span>';
    }

    // Actualizar estadísticas
    actualizarEstadisticas(empresa) {
        const stats = {
            'subastas-publicadas': empresa.subastasCount || 0,
            'rifas-activas': empresa.rifasCount || 0,
            'productos-vendidos': empresa.productosVendidosCount || 0,
            'ingresos-totales': '$' + (empresa.ingresosTotales || 0).toLocaleString('es-CL')
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
            const response = await this.apiClient.updateProfile(datos);
            if (response.success) {
                await this.cargarPerfil();
                
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

    // Cargar mis subastas
    async cargarMisSubastas() {
        try {
            const response = await this.apiClient.getSubastas({ empresa: 'mis' });
            if (response.success) {
                this.renderSubastas(response.subastas);
                return { success: true };
            }
            return { success: false };
        } catch (error) {
            console.error('Error al cargar subastas:', error);
            return { success: false };
        }
    }

    // Renderizar subastas
    renderSubastas(subastas) {
        const container = document.getElementById('mis-subastas-lista');
        if (!container) return;

        if (!subastas || subastas.length === 0) {
            container.innerHTML = '<div class="empty-state">No has publicado subastas aún</div>';
            return;
        }

        container.innerHTML = subastas.map(s => `
            <div class="item-card">
                <img src="${s.imagen || 'images/placeholder.png'}" alt="${s.titulo}">
                <div class="item-info">
                    <h4>${s.titulo}</h4>
                    <p class="precio">$${s.precio_actual.toLocaleString('es-CL')}</p>
                    <span class="badge badge-${s.estado}">${s.estado}</span>
                </div>
                <div class="item-actions">
                    <button onclick="window.location.href='detalle-subasta.html?id=${s.id}'">Ver</button>
                    ${s.estado === 'activa' ? `<button onclick="empresaManager.finalizarSubasta(${s.id})">Finalizar</button>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Cargar mis rifas
    async cargarMisRifas() {
        try {
            const response = await this.apiClient.getRifas({ empresa: 'mis' });
            if (response.success) {
                this.renderRifas(response.rifas);
                return { success: true };
            }
            return { success: false };
        } catch (error) {
            console.error('Error al cargar rifas:', error);
            return { success: false };
        }
    }

    // Renderizar rifas
    renderRifas(rifas) {
        const container = document.getElementById('mis-rifas-lista');
        if (!container) return;

        if (!rifas || rifas.length === 0) {
            container.innerHTML = '<div class="empty-state">No has publicado rifas aún</div>';
            return;
        }

        container.innerHTML = rifas.map(r => `
            <div class="item-card">
                <img src="${r.imagen || 'images/placeholder.png'}" alt="${r.titulo}">
                <div class="item-info">
                    <h4>${r.titulo}</h4>
                    <p>${r.boletos_vendidos} / ${r.boletos_totales} boletos</p>
                    <span class="badge badge-${r.estado}">${r.estado}</span>
                </div>
                <div class="item-actions">
                    <button onclick="window.location.href='detalle-rifa.html?id=${r.id}'">Ver</button>
                </div>
            </div>
        `).join('');
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
        // Tabla general de transacciones (si existe)
        const container = document.getElementById('transacciones-lista');
        if (container) {
            if (!transacciones || transacciones.length === 0) {
                container.innerHTML = '<div class="empty-state">No hay transacciones recientes</div>';
            } else {
                container.innerHTML = transacciones.slice(0, 10).map(t => `
                    <div class="transaction-item">
                        <div class="transaction-icon ${t.tipo}">
                            <i class="fas fa-${this.getTipoIcon(t.tipo)}"></i>
                        </div>
                        <div class="transaction-info">
                            <div class="transaction-title">${this.getTipoLabel(t.tipo)}</div>
                            <div class="transaction-date">${new Date(t.createdAt).toLocaleString('es-CL')}</div>
                        </div>
                        <div class="transaction-amount ${t.tipo === 'deposito' || t.tipo === 'ganancia_subasta' ? 'positive' : 'negative'}">
                            ${t.tipo === 'deposito' || t.tipo === 'ganancia_subasta' ? '+' : '-'}$${Math.abs(t.monto).toLocaleString('es-CL')}
                        </div>
                    </div>
                `).join('');
            }
        }

        // Tablas separadas de ingresos y retiros (para perfil-empresa.html)
        const tbodyIngresos = document.querySelector('#tablaIngresos tbody');
        const tbodyRetiros = document.querySelector('#tablaRetiros tbody');

        if (tbodyIngresos || tbodyRetiros) {
            const ingresos = transacciones.filter(t => 
                t.tipo === 'deposito' || 
                t.tipo === 'ganancia_subasta' || 
                t.tipo === 'reembolso_subasta'
            );
            const retiros = transacciones.filter(t => 
                t.tipo === 'retiro' || 
                t.tipo === 'comision' ||
                t.tipo === 'puja' ||
                t.tipo === 'compra_boleto'
            );

            // Renderizar ingresos
            if (tbodyIngresos) {
                if (ingresos.length === 0) {
                    tbodyIngresos.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">No hay ingresos registrados</td></tr>';
                } else {
                    // Ordenar por fecha descendente
                    ingresos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    tbodyIngresos.innerHTML = '';
                    ingresos.forEach(tx => {
                        const fecha = new Date(tx.createdAt).toLocaleString('es-CL');
                        const monto = new Intl.NumberFormat('es-CL', {
                            style: 'currency',
                            currency: 'CLP',
                            minimumFractionDigits: 0
                        }).format(tx.monto);
                        const saldoFinal = new Intl.NumberFormat('es-CL', {
                            style: 'currency',
                            currency: 'CLP',
                            minimumFractionDigits: 0
                        }).format(tx.saldo_final || 0);

                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${fecha}</td>
                            <td>${tx.descripcion || this.getTipoLabel(tx.tipo)}</td>
                            <td class="ingreso">+${monto}</td>
                            <td>${saldoFinal}</td>
                        `;
                        tbodyIngresos.appendChild(row);
                    });
                }
            }

            // Renderizar retiros
            if (tbodyRetiros) {
                if (retiros.length === 0) {
                    tbodyRetiros.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">No hay retiros registrados</td></tr>';
                } else {
                    // Ordenar por fecha descendente
                    retiros.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    tbodyRetiros.innerHTML = '';
                    retiros.forEach(tx => {
                        const fecha = new Date(tx.createdAt).toLocaleString('es-CL');
                        const monto = new Intl.NumberFormat('es-CL', {
                            style: 'currency',
                            currency: 'CLP',
                            minimumFractionDigits: 0
                        }).format(Math.abs(tx.monto));
                        const saldoFinal = new Intl.NumberFormat('es-CL', {
                            style: 'currency',
                            currency: 'CLP',
                            minimumFractionDigits: 0
                        }).format(tx.saldo_final || 0);

                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${fecha}</td>
                            <td>${tx.descripcion || this.getTipoLabel(tx.tipo)}</td>
                            <td class="egreso">-${monto}</td>
                            <td>${saldoFinal}</td>
                        `;
                        tbodyRetiros.appendChild(row);
                    });
                }
            }
        }
    }

    getTipoIcon(tipo) {
        const icons = {
            'deposito': 'arrow-down',
            'retiro': 'arrow-up',
            'ganancia_subasta': 'gavel',
            'reembolso_subasta': 'undo',
            'comision': 'percent'
        };
        return icons[tipo] || 'exchange-alt';
    }

    getTipoLabel(tipo) {
        const labels = {
            'deposito': 'Depósito',
            'retiro': 'Retiro',
            'ganancia_subasta': 'Ganancia de subasta',
            'reembolso_subasta': 'Reembolso de subasta',
            'comision': 'Comisión de plataforma'
        };
        return labels[tipo] || tipo;
    }

    // Finalizar subasta
    async finalizarSubasta(subastaId) {
        if (!confirm('¿Estás seguro de finalizar esta subasta?')) {
            return;
        }

        try {
            const response = await this.apiClient.finalizarSubasta(subastaId);
            if (response.success) {
                notify.success('Subasta finalizada correctamente');
                await this.cargarMisSubastas();
            } else {
                notify.error(response.message || 'Error al finalizar subasta');
            }
        } catch (error) {
            console.error('Error al finalizar subasta:', error);
            notify.error('Error al finalizar subasta');
        }
    }

    // Cambiar contraseña
    async cambiarPassword(passwordActual, passwordNuevo) {
        try {
            const response = await this.apiClient.changePassword(passwordActual, passwordNuevo);
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

    // Mostrar modal de depósito
    async mostrarModalDeposito() {
        await this.walletManager.showDepositModal();
    }

    // Mostrar modal de retiro
    async mostrarModalRetiro() {
        await this.walletManager.showWithdrawModal();
    }
}

// Crear instancia global
const empresaManager = new EmpresaManager();
