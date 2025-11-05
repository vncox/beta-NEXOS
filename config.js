/**
 * Sistema de Configuración para Nexos
 * Aplica configuraciones de tema, accesibilidad e idioma
 */

// Cargar y aplicar configuraciones al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    aplicarConfiguraciones();
});

function aplicarConfiguraciones() {
    if (!window.auth || !auth.isLoggedIn()) {
        // Si no hay sesión, aplicar configuraciones por defecto
        aplicarConfiguracionesDefault();
        return;
    }

    const account = auth.getCurrentAccount();
    if (!account || !account.configuraciones) {
        aplicarConfiguracionesDefault();
        return;
    }

    const config = account.configuraciones;

    // Aplicar tema
    if (config.tema === 'dark') {
        document.body.classList.add('theme-dark');
    } else {
        document.body.classList.remove('theme-dark');
    }

    // Aplicar accesibilidad
    if (config.accesibilidad) {
        // Alto contraste
        if (config.accesibilidad.altoContraste) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }

        // Tamaño de texto
        const textSize = config.accesibilidad.tamañoTexto || 'normal';
        document.body.classList.remove('text-small', 'text-normal', 'text-large');
        document.body.classList.add('text-' + textSize);

        // Animaciones reducidas
        if (config.accesibilidad.animacionesReducidas) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
    }

    // Aplicar idioma (preparado para futura implementación)
    if (config.idioma) {
        document.documentElement.lang = config.idioma;
    }
}

function aplicarConfiguracionesDefault() {
    // Configuraciones por defecto
    document.body.classList.remove('theme-dark', 'high-contrast', 'reduced-motion');
    document.body.classList.remove('text-small', 'text-large');
    document.body.classList.add('text-normal');
    document.documentElement.lang = 'es';
}

// Función para actualizar una configuración específica en tiempo real
function actualizarConfiguracionVisual(tipo, valor) {
    switch(tipo) {
        case 'tema':
            if (valor === 'dark') {
                document.body.classList.add('theme-dark');
            } else {
                document.body.classList.remove('theme-dark');
            }
            break;

        case 'altoContraste':
            if (valor) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
            break;

        case 'tamañoTexto':
            document.body.classList.remove('text-small', 'text-normal', 'text-large');
            document.body.classList.add('text-' + valor);
            break;

        case 'animacionesReducidas':
            if (valor) {
                document.body.classList.add('reduced-motion');
            } else {
                document.body.classList.remove('reduced-motion');
            }
            break;

        case 'idioma':
            document.documentElement.lang = valor;
            // Aquí se podría implementar cambio de textos en el futuro
            break;
    }
}

// Función helper para obtener el estado actual de una configuración
function obtenerConfiguracionActual(clave) {
    if (!window.auth || !auth.isLoggedIn()) {
        return null;
    }

    const account = auth.getCurrentAccount();
    if (!account || !account.configuraciones) {
        return null;
    }

    // Manejar configuraciones anidadas
    if (clave.includes('.')) {
        const partes = clave.split('.');
        let valor = account.configuraciones;
        for (let parte of partes) {
            if (valor && valor[parte] !== undefined) {
                valor = valor[parte];
            } else {
                return null;
            }
        }
        return valor;
    }

    return account.configuraciones[clave];
}

// Exportar funciones globalmente
window.aplicarConfiguraciones = aplicarConfiguraciones;
window.actualizarConfiguracionVisual = actualizarConfiguracionVisual;
window.obtenerConfiguracionActual = obtenerConfiguracionActual;
