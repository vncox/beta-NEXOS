// Manager para productos con backend
class ProductosManager {
    constructor() {
        this.apiClient = new APIClient();
    }

    // Obtener todos los productos
    async getProductos() {
        try {
            const response = await this.apiClient.get(API_CONFIG.ENDPOINTS.PRODUCTOS);
            if (response.success && response.productos) {
                return { success: true, productos: response.productos };
            }
            return { success: false, productos: [], message: response.message };
        } catch (error) {
            console.error('Error al obtener productos:', error);
            return { success: false, productos: [], message: error.message };
        }
    }

    // Obtener un producto por ID
    async getProductoById(id) {
        try {
            const response = await this.apiClient.get(`${API_CONFIG.ENDPOINTS.PRODUCTOS}/${id}`);
            if (response.success && response.producto) {
                return { success: true, producto: response.producto };
            }
            return { success: false, producto: null, message: response.message };
        } catch (error) {
            console.error('Error al obtener producto:', error);
            return { success: false, producto: null, message: error.message };
        }
    }

    // Crear un nuevo producto
    async crearProducto(datos) {
        try {
            const response = await this.apiClient.post(API_CONFIG.ENDPOINTS.PRODUCTOS, datos);
            if (response.success && response.producto) {
                return { success: true, producto: response.producto };
            }
            return { success: false, message: response.message || 'Error al crear producto' };
        } catch (error) {
            console.error('Error al crear producto:', error);
            return { success: false, message: error.message };
        }
    }

    // Actualizar un producto
    async actualizarProducto(id, datos) {
        try {
            const response = await this.apiClient.put(`${API_CONFIG.ENDPOINTS.PRODUCTOS}/${id}`, datos);
            if (response.success) {
                return { success: true, producto: response.producto };
            }
            return { success: false, message: response.message || 'Error al actualizar producto' };
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            return { success: false, message: error.message };
        }
    }

    // Eliminar un producto
    async eliminarProducto(id) {
        try {
            const response = await this.apiClient.delete(`${API_CONFIG.ENDPOINTS.PRODUCTOS}/${id}`);
            if (response.success) {
                return { success: true, message: 'Producto eliminado correctamente' };
            }
            return { success: false, message: response.message || 'Error al eliminar producto' };
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            return { success: false, message: error.message };
        }
    }

    // Comprar un producto
    async comprarProducto(productoId, cantidad) {
        try {
            const response = await this.apiClient.post(`${API_CONFIG.ENDPOINTS.PRODUCTOS}/${productoId}/comprar`, {
                cantidad
            });
            if (response.success) {
                return { success: true, transaccion: response.transaccion, message: 'Compra realizada correctamente' };
            }
            return { success: false, message: response.message || 'Error al comprar producto' };
        } catch (error) {
            console.error('Error al comprar producto:', error);
            return { success: false, message: error.message };
        }
    }

    // Obtener productos de una empresa específica
    async getProductosEmpresa(empresaId) {
        try {
            const response = await this.apiClient.get(`${API_CONFIG.ENDPOINTS.PRODUCTOS}?empresaId=${empresaId}`);
            if (response.success && response.productos) {
                return { success: true, productos: response.productos };
            }
            return { success: false, productos: [], message: response.message };
        } catch (error) {
            console.error('Error al obtener productos de empresa:', error);
            return { success: false, productos: [], message: error.message };
        }
    }

    // Filtrar productos por categoría
    async getProductosPorCategoria(categoria) {
        try {
            const response = await this.apiClient.get(`${API_CONFIG.ENDPOINTS.PRODUCTOS}?categoria=${categoria}`);
            if (response.success && response.productos) {
                return { success: true, productos: response.productos };
            }
            return { success: false, productos: [], message: response.message };
        } catch (error) {
            console.error('Error al obtener productos por categoría:', error);
            return { success: false, productos: [], message: error.message };
        }
    }

    // Buscar productos
    async buscarProductos(termino) {
        try {
            const response = await this.apiClient.get(`${API_CONFIG.ENDPOINTS.PRODUCTOS}?buscar=${encodeURIComponent(termino)}`);
            if (response.success && response.productos) {
                return { success: true, productos: response.productos };
            }
            return { success: false, productos: [], message: response.message };
        } catch (error) {
            console.error('Error al buscar productos:', error);
            return { success: false, productos: [], message: error.message };
        }
    }
}

// Instancia global
const productosManager = new ProductosManager();
