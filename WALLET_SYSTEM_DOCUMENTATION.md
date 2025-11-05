# Sistema de Wallet - Documentación

## Descripción General
Se ha implementado un sistema completo de gestión financiera (wallet) para usuarios y empresas en la plataforma Nexos.

## Características Implementadas

### 1. Estructura de Datos

#### Usuarios
- `saldo`: Balance disponible (default: Admin 1,000,000 CLP, Usuario1 500,000 CLP, otros 0 CLP)
- `transacciones`: Array de transacciones con campos:
  - `id`: Identificador único
  - `fecha`: Timestamp ISO
  - `tipo`: 'ingreso' o 'egreso'
  - `monto`: Cantidad en CLP
  - `descripcion`: Motivo de la transacción
  - `saldoAnterior`: Saldo antes de la transacción
  - `saldoNuevo`: Saldo después de la transacción

#### Empresas
- `saldo`: Balance disponible (default: 0 CLP)
- `ingresos`: Array de ingresos con campos:
  - `id`: Identificador único
  - `fecha`: Timestamp ISO
  - `monto`: Cantidad en CLP
  - `descripcion`: Origen del ingreso
  - `saldoNuevo`: Saldo después del ingreso
- `retiros`: Array de retiros con campos similares a ingresos

### 2. Funciones en auth.js

#### `getSaldo(accountId, type)`
Obtiene el saldo actual de una cuenta.
- **Parámetros**: 
  - `accountId`: ID del usuario o empresa
  - `type`: 'user' o 'empresa'
- **Retorna**: Número (saldo en CLP)

#### `modificarSaldo(accountId, monto, motivo, type)`
Modifica el saldo de una cuenta (solo para admin).
- **Parámetros**:
  - `accountId`: ID de la cuenta
  - `monto`: Cantidad a agregar/restar (negativo para restar)
  - `motivo`: Descripción de la operación
  - `type`: 'user' o 'empresa'
- **Retorna**: `{ success: boolean, message: string, nuevoSaldo: number }`

#### `registrarTransaccion(accountId, tipo, monto, descripcion, type)`
Registra una transacción en una cuenta.
- **Parámetros**:
  - `accountId`: ID de la cuenta
  - `tipo`: 'ingreso', 'egreso', o 'retiro'
  - `monto`: Cantidad de la transacción
  - `descripcion`: Descripción de la transacción
  - `type`: 'user' o 'empresa'
- **Retorna**: `{ success: boolean, message: string, nuevoSaldo: number }`
- **Validación**: Verifica saldo suficiente para egresos/retiros

#### `getTransacciones(accountId, type)`
Obtiene el historial de transacciones.
- **Parámetros**:
  - `accountId`: ID de la cuenta
  - `type`: 'user' o 'empresa'
- **Retorna**: 
  - Para usuarios: Array de transacciones
  - Para empresas: `{ ingresos: [], retiros: [] }`

### 3. Navbar con Wallet

#### Visualización
- Icono de wallet (fa-wallet) visible al lado del nombre de usuario
- Monto formateado en CLP con separadores de miles
- Link clickeable que redirige a la sección de finanzas (#finanzas)
- Estilo con gradiente azul y efecto hover
- Se actualiza automáticamente al modificar saldo

#### Dropdown Menu
- Nuevo item "Mi Wallet" en el menú desplegable
- Redirige a la pestaña de finanzas del perfil

### 4. Perfil de Usuarios (perfil.html)

#### Nueva Pestaña "Mi Wallet"
Contiene tres secciones:

1. **Resumen de Wallet**
   - Card con fondo degradado azul
   - Muestra saldo actual en formato moneda CLP
   - Diseño destacado y llamativo

2. **Historial de Transacciones**
   - Tabla con columnas: Fecha, Tipo, Descripción, Monto, Saldo
   - Badges de colores para tipo (verde=ingreso, rojo=egreso)
   - Ordenadas por fecha descendente (más reciente primero)
   - Formato de moneda chilena en todos los montos
   - Mensaje cuando no hay transacciones

3. **Controles de Admin** (solo visible para admin)
   - Formulario para agregar/retirar saldo
   - Dropdown para seleccionar tipo de operación
   - Campo de monto (mínimo 1000, steps de 1000)
   - Campo de motivo/descripción
   - Validación y feedback de errores

### 5. Perfil de Empresas (perfil-empresa.html)

#### Nueva Pestaña "Finanzas"
Contiene cuatro secciones:

1. **Wallet Empresarial**
   - Card con saldo actual destacado
   - Botón "Crear Nueva Subasta/Rifa" que redirige a la pestaña de subastas

2. **Tabla de Ingresos**
   - Muestra todos los ingresos recibidos
   - Columnas: Fecha, Descripción, Monto (+), Saldo Final
   - Color verde para montos
   - Ordenados por fecha descendente

3. **Tabla de Retiros**
   - Muestra todos los retiros realizados
   - Columnas: Fecha, Descripción, Monto (-), Saldo Final
   - Color rojo para montos
   - Ordenados por fecha descendente

4. **Controles de Admin** (solo visible para admin)
   - Formulario para simular ingresos o retiros
   - Útil para pruebas del sistema
   - Validación de saldo suficiente

### 6. Estilos CSS

#### Wallet Link en Navbar
```css
.wallet-link
- Display flex con gap
- Gradiente azul (#4a90e2 → #357abd)
- Border-radius redondeado (50px)
- Box-shadow con efecto hover
- Transiciones suaves
```

#### Wallet Balance Card
```css
.wallet-balance
- Gradiente azul de fondo
- Padding generoso
- Sombra pronunciada
- Texto blanco
- Fuente grande (2.5rem) para el monto
```

#### Tablas de Transacciones
```css
.transactions-table
- Ancho completo
- Bordes colapsados
- Hover en filas (#f8f9fa)
- Colores específicos:
  - Ingresos: #28a745 (verde)
  - Egresos: #dc3545 (rojo)
```

#### Badges de Tipo
```css
.tipo-badge
- Inline-block con padding
- Border-radius redondeado
- Colores de fondo según tipo
- Font pequeño (0.85rem)
```

## Flujo de Uso

### Para Usuarios Normales
1. Iniciar sesión
2. Ver saldo en navbar (esquina superior derecha)
3. Click en wallet para ir a "Mi Wallet"
4. Ver historial de transacciones
5. (Futuro) Pujar en subastas deducirá del saldo

### Para Empresas
1. Iniciar sesión
2. Ver saldo empresarial en navbar
3. Click en wallet para ir a "Finanzas"
4. Ver ingresos recibidos por pujas
5. Ver retiros realizados
6. Crear nuevas subastas desde botón directo

### Para Administradores
1. Acceso a controles especiales en ambos perfiles
2. Puede modificar saldo de cualquier cuenta
3. Puede simular transacciones para pruebas
4. Útil para testing del sistema

## Inicialización Automática

El sistema incluye lógica de inicialización que:
- Agrega campos de wallet a cuentas existentes
- Asigna saldo inicial:
  - Admin: $1,000,000 CLP
  - Usuario1: $500,000 CLP
  - Otras cuentas: $0 CLP
- Inicializa arrays vacíos para transacciones

## Formato de Moneda

Todos los montos se muestran en formato CLP chileno:
- Símbolo: $
- Separador de miles: punto (.)
- Sin decimales
- Ejemplo: $1.000.000

## Validaciones

### En modificarSaldo()
- Solo admin puede ejecutar
- Verifica existencia de cuenta
- Inicializa campos si no existen

### En registrarTransaccion()
- Valida saldo suficiente para egresos
- Registra saldo anterior y nuevo
- Actualiza localStorage automáticamente
- Retorna error si saldo insuficiente

## Próximas Integraciones

### Conectar con Sistema de Pujas
El siguiente paso es integrar el sistema de wallet con las pujas:
1. Al realizar una puja, deducir del saldo del usuario
2. Al finalizar subasta, transferir monto al saldo de la empresa
3. Registrar transacciones en ambas cuentas
4. Validar saldo suficiente antes de permitir puja

Función a implementar en `detalle-subasta.html`:
```javascript
function realizarPuja(e) {
    e.preventDefault();
    const session = auth.getSession();
    const monto = parseInt(inputPuja.value);
    
    // Validar saldo
    const saldo = auth.getSaldo(session.userId, 'user');
    if (saldo < monto) {
        alert('Saldo insuficiente');
        return;
    }
    
    // Registrar puja
    // ... código existente ...
    
    // Deducir del saldo
    auth.registrarTransaccion(
        session.userId, 
        'egreso', 
        monto, 
        `Puja en subasta: ${subasta.titulo}`,
        'user'
    );
    
    // Actualizar navbar
    updateNavbar();
}
```

## Archivos Modificados

1. **auth.js**
   - Añadidos métodos de wallet (líneas 725-893)
   - Actualizada función updateNavbar() para mostrar wallet
   - Inicialización de saldos en createAdminAccounts()

2. **style.css**
   - Estilos para .wallet-link
   - Estilos para .wallet-amount
   - Actualizado .user-menu con display: flex

3. **perfil.html**
   - Nueva pestaña "Mi Wallet"
   - Funciones JavaScript para cargar wallet
   - Estilos inline para tablas y cards
   - Formulario de control admin

4. **perfil-empresa.html**
   - Nueva pestaña "Finanzas"
   - Funciones JavaScript para wallet empresarial
   - Tablas de ingresos y retiros
   - Estilos inline idénticos a perfil.html

## Testing

### Pasos de Prueba
1. Iniciar sesión como admin (usuario: admin@nexos.com, pass: admin123)
2. Ver wallet en navbar mostrando $1,000,000
3. Click en wallet → ir a pestaña "Mi Wallet"
4. Usar controles admin para agregar/retirar saldo
5. Verificar que transacciones aparecen en tabla
6. Verificar que saldo se actualiza en navbar automáticamente
7. Cambiar a empresa admin
8. Verificar wallet empresarial y tablas

### Casos Edge
- ✓ Cuentas existentes sin saldo → se inicializan a 0
- ✓ Intentar retirar más que saldo → error controlado
- ✓ Usuario no admin intenta modificar saldo → error de permisos
- ✓ Recargar página mantiene transacciones (localStorage)

## Conclusión

El sistema de wallet está completamente implementado y funcional, con:
- ✅ Gestión de saldos para usuarios y empresas
- ✅ Historial completo de transacciones
- ✅ Visualización en navbar clickeable
- ✅ Interfaces de usuario intuitivas
- ✅ Controles de administración
- ✅ Validaciones robustas
- ✅ Formato de moneda chilena
- ⏳ Falta: Integración con sistema de pujas (próximo paso)
