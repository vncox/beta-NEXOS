// Sistema de Notificaciones Toast para Nexos
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Crear contenedor de toasts si no existe
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    // Mostrar toast genérico
    showToast(message, type = 'info', duration = 4000, title = '') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const titles = {
            success: title || 'Éxito',
            error: title || 'Error',
            warning: title || 'Advertencia',
            info: title || 'Información'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-title">${titles[type]}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        this.container.appendChild(toast);

        // Auto-cerrar después de la duración especificada
        if (duration > 0) {
            setTimeout(() => {
                toast.classList.add('hiding');
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, 300);
            }, duration);
        }

        return toast;
    }

    // Métodos específicos para cada tipo
    success(message, duration = 4000, title = '') {
        return this.showToast(message, 'success', duration, title);
    }

    error(message, duration = 5000, title = '') {
        return this.showToast(message, 'error', duration, title);
    }

    warning(message, duration = 4500, title = '') {
        return this.showToast(message, 'warning', duration, title);
    }

    info(message, duration = 4000, title = '') {
        return this.showToast(message, 'info', duration, title);
    }

    // Confirmación personalizada (reemplazo de confirm)
    confirm(message, title = '¿Estás seguro?', options = {}) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'confirm-modal';

            const confirmText = options.confirmText || 'Confirmar';
            const cancelText = options.cancelText || 'Cancelar';
            const icon = options.icon || '❓';
            const type = options.type || 'warning';

            modal.innerHTML = `
                <div class="confirm-modal-content">
                    <div class="confirm-modal-icon">${icon}</div>
                    <div class="confirm-modal-title">${title}</div>
                    <div class="confirm-modal-message">${message}</div>
                    <div class="confirm-modal-buttons">
                        <button class="confirm-modal-button cancel">${cancelText}</button>
                        <button class="confirm-modal-button confirm">${confirmText}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const confirmBtn = modal.querySelector('.confirm-modal-button.confirm');
            const cancelBtn = modal.querySelector('.confirm-modal-button.cancel');

            confirmBtn.addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });

            cancelBtn.addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });

            // Cerrar al hacer clic fuera del modal
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve(false);
                }
            });

            // Cerrar con ESC
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    modal.remove();
                    resolve(false);
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        });
    }

    // Prompt personalizado (reemplazo de prompt)
    prompt(message, title = 'Ingresa información', defaultValue = '', options = {}) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'confirm-modal';

            const confirmText = options.confirmText || 'Aceptar';
            const cancelText = options.cancelText || 'Cancelar';
            const placeholder = options.placeholder || '';
            const inputType = options.inputType || 'text';

            modal.innerHTML = `
                <div class="confirm-modal-content">
                    <div class="confirm-modal-title">${title}</div>
                    <div class="confirm-modal-message">${message}</div>
                    <input type="${inputType}" class="prompt-modal-input" value="${defaultValue}" placeholder="${placeholder}">
                    <div class="confirm-modal-buttons">
                        <button class="confirm-modal-button cancel">${cancelText}</button>
                        <button class="confirm-modal-button confirm">${confirmText}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const input = modal.querySelector('.prompt-modal-input');
            const confirmBtn = modal.querySelector('.confirm-modal-button.confirm');
            const cancelBtn = modal.querySelector('.confirm-modal-button.cancel');

            // Focus en el input
            setTimeout(() => input.focus(), 100);

            const handleConfirm = () => {
                const value = input.value.trim();
                modal.remove();
                resolve(value || null);
            };

            const handleCancel = () => {
                modal.remove();
                resolve(null);
            };

            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);

            // Enter para confirmar
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleConfirm();
                }
            });

            // Cerrar al hacer clic fuera
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    handleCancel();
                }
            });

            // Cerrar con ESC
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    handleCancel();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        });
    }

    // Reemplazo de alert
    alert(message, type = 'info', title = '') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'confirm-modal';

            const icons = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ℹ'
            };

            const titles = {
                success: title || 'Éxito',
                error: title || 'Error',
                warning: title || 'Advertencia',
                info: title || 'Información'
            };

            modal.innerHTML = `
                <div class="confirm-modal-content">
                    <div class="confirm-modal-icon">${icons[type]}</div>
                    <div class="confirm-modal-title">${titles[type]}</div>
                    <div class="confirm-modal-message">${message}</div>
                    <div class="confirm-modal-buttons">
                        <button class="confirm-modal-button confirm" style="width: 100%">Aceptar</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const confirmBtn = modal.querySelector('.confirm-modal-button.confirm');

            confirmBtn.addEventListener('click', () => {
                modal.remove();
                resolve();
            });

            // Cerrar al hacer clic fuera
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve();
                }
            });

            // Cerrar con ESC o Enter
            const keyHandler = (e) => {
                if (e.key === 'Escape' || e.key === 'Enter') {
                    modal.remove();
                    resolve();
                    document.removeEventListener('keydown', keyHandler);
                }
            };
            document.addEventListener('keydown', keyHandler);

            // Focus en el botón
            setTimeout(() => confirmBtn.focus(), 100);
        });
    }
}

// Instancia global
const notify = new NotificationSystem();

// Compatibilidad hacia atrás - sobrescribir funciones nativas del navegador
window.originalAlert = window.alert;
window.originalConfirm = window.confirm;
window.originalPrompt = window.prompt;

// Reemplazar alert, confirm y prompt con versiones personalizadas
window.alert = function(message) {
    // Detectar tipo basado en el contenido
    let type = 'info';
    let cleanMessage = message;
    
    if (message.startsWith('✅') || message.includes('éxito') || message.includes('Éxito')) {
        type = 'success';
        cleanMessage = message.replace('✅', '').trim();
    } else if (message.startsWith('❌') || message.includes('Error') || message.includes('error')) {
        type = 'error';
        cleanMessage = message.replace('❌', '').trim();
    } else if (message.startsWith('⚠') || message.includes('Advertencia') || message.includes('advertencia')) {
        type = 'warning';
        cleanMessage = message.replace('⚠', '').trim();
    }
    
    return notify.alert(cleanMessage, type);
};

window.confirm = function(message) {
    return notify.confirm(message);
};

window.prompt = function(message, defaultValue = '') {
    return notify.prompt(message, 'Ingresa información', defaultValue);
};
