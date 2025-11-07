/**
 * Helper para inicializar el navbar con autenticación
 * Incluir este script después de auth-backend.js
 */

function inicializarNavbar() {
    console.log('🔧 Inicializando navbar...');
    
    if (typeof authBackend === 'undefined') {
        console.warn('⚠️ auth-backend.js no está cargado');
        return;
    }

    const ctaButton = document.querySelector('.cta-button');
    if (!ctaButton) {
        console.warn('⚠️ No se encontró el botón .cta-button');
        return;
    }
    
    console.log('✅ Botón encontrado:', ctaButton);

    if (authBackend.isLoggedIn()) {
        console.log('👤 Usuario autenticado, mostrando menú...');
        const session = authBackend.getCurrentUser();
        
        // Crear menú de usuario
        const userMenu = document.createElement('div');
        userMenu.style.cssText = 'position: relative; display: inline-block;';
        userMenu.innerHTML = `
            <button class="cta-button" style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-user-circle"></i>
                <span>${session.nombre || session.razon_social || session.username}</span>
                <i class="fas fa-chevron-down" style="font-size: 0.8rem;"></i>
            </button>
            <div id="userDropdown" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 0.5rem; background: white; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 200px; z-index: 1000;">
                <a href="${session.role === 'admin' ? 'admin.html' : (session.role === 'empresa' ? 'perfil-empresa.html' : 'perfil.html')}" style="display: block; padding: 1rem; color: #333; text-decoration: none; border-bottom: 1px solid #eee;">
                    <i class="fas fa-user" style="margin-right: 0.5rem;"></i>Mi Perfil
                </a>
                ${session.role === 'admin' ? '<a href="admin.html" style="display: block; padding: 1rem; color: #333; text-decoration: none; border-bottom: 1px solid #eee;"><i class="fas fa-cog" style="margin-right: 0.5rem;"></i>Administración</a>' : ''}
                <a href="#" onclick="authBackend.logout(); window.location.reload(); return false;" style="display: block; padding: 1rem; color: #e74c3c; text-decoration: none;">
                    <i class="fas fa-sign-out-alt" style="margin-right: 0.5rem;"></i>Cerrar Sesión
                </a>
            </div>
        `;
        
        ctaButton.replaceWith(userMenu);
        
        // Toggle dropdown
        userMenu.querySelector('button').addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = document.getElementById('userDropdown');
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });
        
        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', function() {
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) dropdown.style.display = 'none';
        });
    } else {
        // Si no está autenticado, agregar evento de clic al botón de login
        console.log('🔓 Usuario NO autenticado, agregando evento al botón...');
        ctaButton.addEventListener('click', function(e) {
            console.log('🖱️ Click en botón de login detectado!');
            e.preventDefault();
            window.location.href = 'login.html';
        });
        console.log('✅ Evento agregado correctamente');
    }
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarNavbar);
} else {
    inicializarNavbar();
}
