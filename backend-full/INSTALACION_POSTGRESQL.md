# 🔧 GUÍA DE INSTALACIÓN Y CONFIGURACIÓN

## ⚠️ PROBLEMA ACTUAL

PostgreSQL no está instalado o no está corriendo en tu sistema. Veo el error:
```
ECONNREFUSED - No se puede conectar a PostgreSQL
```

## 📦 SOLUCIÓN: Instalar PostgreSQL

### OPCIÓN 1: PostgreSQL Completo (Recomendado)

1. **Descargar PostgreSQL**
   - Ve a: https://www.postgresql.org/download/windows/
   - Descarga el instalador de EnterpriseDB
   - Versión recomendada: PostgreSQL 15 o 16

2. **Instalar PostgreSQL**
   - Ejecuta el instalador
   - Contraseña para usuario `postgres`: **Anota esta contraseña** (ej: `postgres`)
   - Puerto: `5432` (por defecto)
   - Instala Stack Builder: **NO** (no es necesario)

3. **Verificar instalación**
   ```powershell
   psql --version
   ```

4. **Iniciar PostgreSQL**
   - Busca "Services" en Windows
   - Busca "PostgreSQL" 
   - Click derecho → Start (si no está corriendo)

### OPCIÓN 2: Docker (Alternativa rápida)

Si tienes Docker instalado:

```powershell
docker run --name postgres-nexos -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

## 🗄️ CREAR BASE DE DATOS

### Con pgAdmin (GUI):

1. Abre **pgAdmin 4** (se instaló con PostgreSQL)
2. Conéctate al servidor (password que pusiste en instalación)
3. Click derecho en "Databases" → Create → Database
4. Nombre: `nexos_db`
5. Click "Save"

### Con línea de comandos (psql):

```powershell
# Conectar a PostgreSQL
psql -U postgres

# Dentro de psql, crear la base de datos:
CREATE DATABASE nexos_db;

# Salir
\q
```

## ⚙️ CONFIGURAR EL BACKEND

1. **Editar archivo `.env`**

Abre el archivo `backend-full\.env` y ajusta la contraseña:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nexos_db
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_DE_POSTGRES_AQUI
```

## ✅ VERIFICAR CONEXIÓN

Ejecuta este comando para probar la conexión:

```powershell
cd C:\Users\vrive\OneDrive\Documentos\codigos\beta-NEXOS\backend-full

# Probar conexión
node -e "const { Client } = require('pg'); const client = new Client({ host: 'localhost', port: 5432, database: 'nexos_db', user: 'postgres', password: 'postgres' }); client.connect().then(() => { console.log('✅ Conexión exitosa'); client.end(); }).catch(err => console.error('❌ Error:', err.message));"
```

## 🚀 INICIAR EL BACKEND

Una vez PostgreSQL esté corriendo y la base de datos creada:

```powershell
# 1. Inicializar base de datos (crea tablas y admin)
npm run init-db

# 2. Poblar con datos de prueba (opcional)
npm run seed

# 3. Iniciar servidor
npm run dev
```

## 🆘 TROUBLESHOOTING

### Error: "psql no se reconoce como comando"

PostgreSQL no está en el PATH. Opciones:

**A) Agregar al PATH:**
1. Busca la carpeta de instalación: `C:\Program Files\PostgreSQL\15\bin`
2. Sistema → Propiedades avanzadas → Variables de entorno
3. Editar PATH → Agregar nueva ruta

**B) Usar la ruta completa:**
```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
```

### Error: "password authentication failed"

La contraseña en `.env` no coincide. Verifica:
1. Abre `.env`
2. Cambia `DB_PASSWORD=` con tu contraseña real

### PostgreSQL no inicia

1. Abre "Services" (Servicios de Windows)
2. Busca "postgresql-x64-15" (o tu versión)
3. Click derecho → Iniciar

### Puerto 5432 ocupado

Cambia el puerto en `.env`:
```env
DB_PORT=5433
```

Y en la configuración de PostgreSQL.

## 📝 RESUMEN DE PASOS

```powershell
# 1. Instalar PostgreSQL (si no lo tienes)
# Descargar de: https://www.postgresql.org/download/windows/

# 2. Crear base de datos
psql -U postgres
CREATE DATABASE nexos_db;
\q

# 3. Editar .env con tu password correcto
# backend-full\.env → DB_PASSWORD=tu_password

# 4. Inicializar
npm run init-db

# 5. Poblar datos de prueba
npm run seed

# 6. Iniciar servidor
npm run dev
```

## ✨ ALTERNATIVA SIN POSTGRESQL

Si no quieres instalar PostgreSQL, puedo ayudarte a:

1. **Usar SQLite** (base de datos en archivo, más simple)
2. **Usar MongoDB** (si ya lo tienes instalado)
3. **Seguir con localStorage** (sin backend)

¿Qué prefieres?
