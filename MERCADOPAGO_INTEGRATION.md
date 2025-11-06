# Integración de Mercado Pago - Sistema Nexos

## 📋 Descripción

Este sistema utiliza la API de **Mercado Pago** en modo **Sandbox** para procesar pagos simulados sin usar dinero real. Es ideal para desarrollo y testing.

## 🔑 Configuración de Credenciales

### Paso 1: Obtener Credenciales de Prueba

1. Ve a [Mercado Pago Developers](https://www.mercadopago.cl/developers/panel)
2. Inicia sesión con tu cuenta de Mercado Pago
3. Ve a **"Tus integraciones"** > **"Crear aplicación"**
4. Obtén tus **Credenciales de prueba**:
   - **Public Key** (TEST-xxxxx...)
   - **Access Token** (TEST-xxxxx...)

### Paso 2: Configurar en el Sistema

Abre el archivo `mercadopago.js` y reemplaza la clave pública:

```javascript
publicKey: 'TEST-tu-public-key-aqui', // ← Reemplaza aquí
```

Con tu **Public Key** de prueba.

## 🎯 Funcionalidades Implementadas

### 1. Compra de Boletos de Rifa
- **Archivo**: `detalle-rifa.html`
- **Método**: `MercadoPagoPayment.procesarPagoRifa(rifaId, boletos)`
- **Función**: Permite comprar múltiples boletos de una rifa

### 2. Compra de Productos
- **Archivo**: `detalle-producto.html`
- **Método**: `MercadoPagoPayment.procesarPagoProducto(productoId, cantidad)`
- **Función**: Permite comprar productos con control de stock

### 3. Pujas en Subastas (Próximamente)
- **Método**: `MercadoPagoPayment.procesarPagoSubasta(subastaId, monto)`
- **Función**: Permite realizar pujas con verificación de monto

## 💳 Tarjetas de Prueba

Para simular pagos en el modo Sandbox, usa estas tarjetas de prueba:

### Visa - Pago Aprobado
```
Número: 4509 9535 6623 3704
CVV: 123
Fecha de vencimiento: 11/25
```

### Mastercard - Pago Aprobado
```
Número: 5031 7557 3453 0604
CVV: 123
Fecha de vencimiento: 11/25
```

### Visa - Pago Rechazado
```
Número: 4509 9534 6623 3704
CVV: 123
Fecha de vencimiento: 11/25
```

> 📌 **Nota**: En modo Sandbox, el sistema simula el flujo de pago completo pero NO procesa dinero real.

## 🔄 Flujo de Pago

1. **Usuario selecciona producto/boletos**
2. **Sistema crea preferencia de pago** con los detalles de la transacción
3. **Modal de Mercado Pago** se muestra (simulado en Sandbox)
4. **Usuario aprueba o rechaza** el pago
5. **Sistema procesa la transacción**:
   - Actualiza stock/boletos
   - Transfiere dinero a la empresa
   - Genera ID de transacción único
   - Registra en historial

## 📊 Registro de Transacciones

Todas las transacciones se registran en `localStorage` con:

```javascript
{
    tipo: 'rifa' | 'producto' | 'subasta',
    itemId: 'id-del-item',
    monto: 5000,
    transactionId: 'MP-1234567890-abc123',
    usuario: 'user@example.com',
    fecha: '2025-11-06T10:30:00.000Z',
    metodo: 'mercadopago',
    status: 'approved' | 'rejected' | 'pending'
}
```

## 🚀 Pasar a Producción

Cuando estés listo para usar dinero real:

1. **Obtén credenciales de producción** en el panel de Mercado Pago
2. **Reemplaza la Public Key** en `mercadopago.js`
3. **Configura un backend** para manejar las preferencias de pago
4. **Implementa webhooks** para recibir notificaciones de pago
5. **Reemplaza** la función `simularPagoSandbox()` con la integración real

### Ejemplo de Backend (Node.js)

```javascript
const mercadopago = require('mercadopago');

mercadopago.configure({
    access_token: 'TU_ACCESS_TOKEN_DE_PRODUCCION'
});

app.post('/create_preference', async (req, res) => {
    const preference = {
        items: [req.body.item],
        payer: req.body.payer,
        back_urls: req.body.back_urls,
        auto_return: 'approved'
    };
    
    const response = await mercadopago.preferences.create(preference);
    res.json({ id: response.body.id });
});
```

## ⚠️ Importante

- **NO USES CREDENCIALES DE PRODUCCIÓN EN EL FRONTEND**
- En producción, todas las credenciales y operaciones deben manejarse en el backend
- El frontend solo debe recibir el `init_point` o `preference_id` del backend
- Implementa validaciones de seguridad en el backend

## 🧪 Testing

Para probar el sistema:

1. Abre `rifas.html` o `ventas.html`
2. Selecciona un producto o boletos
3. Haz clic en "Comprar"
4. Se abrirá el modal de pago simulado
5. Haz clic en "Aprobar Pago" o "Rechazar"

## 📝 Notas Adicionales

- El sistema actual simula el flujo completo de Mercado Pago
- No se procesa dinero real en modo Sandbox
- Todas las transacciones se almacenan localmente
- Los balances de empresas se actualizan automáticamente

## 🆘 Soporte

Para más información:
- [Documentación de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs)
- [SDK de JavaScript](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/landing)
- [Preguntas Frecuentes](https://www.mercadopago.com.ar/developers/es/support)
