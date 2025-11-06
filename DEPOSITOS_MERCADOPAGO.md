# Actualización: Sistema de Depósitos con Mercado Pago

## 🎉 Cambios Realizados

Se ha reemplazado el sistema de depósitos simulado de WebPay por la integración real de **Mercado Pago** en modo Sandbox.

## 📝 Archivos Modificados

### 1. `perfil.html`
- ✅ Agregado script de `mercadopago.js` en el head
- ✅ Función `continuarAWebPay()` ahora usa `MercadoPagoPayment.procesarDeposito()`
- ✅ Eliminada función antigua `procesarPago()` de WebPay
- ✅ Sistema actualizado para usar modal de Mercado Pago

### 2. `mercadopago.js`
- ✅ Nueva función `procesarDeposito(monto)` - Procesa depósitos a billetera
- ✅ Nueva función `procesarDepositoAprobado()` - Actualiza saldo del usuario
- ✅ Integración con el sistema de transacciones existente
- ✅ Soporte para depósitos en `simularPagoSandbox()`

## 🎯 Cómo Funciona Ahora

### Flujo de Depósito:

1. **Usuario ingresa monto** en el modal de depósito
2. **Click en "Continuar con el Pago"**
3. **Se abre modal de Mercado Pago** (simulado en Sandbox)
4. **Usuario aprueba o rechaza** el pago
5. **Si aprueba:**
   - Se actualiza el saldo del usuario
   - Se registra transacción con ID único (MP-xxxxx)
   - Se actualiza interfaz automáticamente
   - Mensaje de éxito con nuevo saldo

### Ejemplo de Uso:

```javascript
// El usuario hace click en "Depositar Dinero"
mostrarModalDeposito();

// Ingresa monto (ej: $10000)
// Click en "Continuar con el Pago"

// Se ejecuta automáticamente:
const resultado = await MercadoPagoPayment.procesarDeposito(10000);

if (resultado.success) {
    // Saldo actualizado automáticamente
    console.log('Nuevo saldo:', resultado.saldoNuevo);
}
```

## 💳 Tarjetas de Prueba

Las mismas tarjetas de prueba de Mercado Pago funcionan:

**Aprobada:**
```
4509 9535 6623 3704
CVV: 123
```

**Rechazada:**
```
4509 9534 6623 3704
CVV: 123
```

## 📊 Registro de Transacciones

Cada depósito se registra con:

```javascript
{
    id: "MP-1730901234567-abc123",
    ticketId: "MP-1730901234567-abc123",
    tipo: "ingreso",
    concepto: "Depósito a billetera",
    monto: 10000,
    fecha: "2025-11-06T10:30:00.000Z",
    metodo: "mercadopago"
}
```

## ✨ Ventajas del Nuevo Sistema

1. **Consistencia**: Mismo sistema de pago para todo (depósitos, rifas, productos)
2. **Realismo**: Modal idéntico al de Mercado Pago real
3. **Trazabilidad**: IDs únicos con formato Mercado Pago
4. **Preparado para producción**: Fácil migrar a credenciales reales

## 🔄 Migración a Producción

Cuando estés listo para usar dinero real:

1. Obtén credenciales de **producción** en Mercado Pago
2. Reemplaza `publicKey` en `mercadopago.js`
3. Configura backend para manejar webhooks
4. Reemplaza `simularPagoSandbox()` con integración real

## ⚠️ Importante

- El sistema sigue en **modo Sandbox** (sin dinero real)
- Los depósitos se procesan localmente en localStorage
- Para pruebas, usa las tarjetas de prueba de Mercado Pago
- El flujo es idéntico al sistema de producción

## 🧪 Testing

Para probar:

1. Inicia sesión como usuario normal
2. Ve a "Mi Perfil"
3. Click en "Depositar Dinero"
4. Ingresa un monto (mínimo $1.000)
5. Click en "Continuar con el Pago"
6. Aprueba el pago en el modal de Mercado Pago
7. Verifica que tu saldo se actualiza correctamente

## 📌 Notas

- La funcionalidad de WebPay ha sido completamente reemplazada
- El modal de WebPay antiguo ya no se usa
- Todos los depósitos ahora usan Mercado Pago
- El historial de transacciones se mantiene compatible
