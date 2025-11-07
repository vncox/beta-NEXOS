// Script para crear la base de datos nexos_db
require('dotenv').config();
const { Client } = require('pg');

async function createDatabase() {
    // Conectar al servidor PostgreSQL (base de datos por defecto 'postgres')
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: 'postgres' // Conectar a la BD por defecto
    });

    try {
        await client.connect();
        console.log('✅ Conectado a PostgreSQL');

        // Verificar si la base de datos ya existe
        const checkDb = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            ['nexos_db']
        );

        if (checkDb.rows.length > 0) {
            console.log('ℹ️  La base de datos "nexos_db" ya existe');
        } else {
            // Crear la base de datos
            await client.query('CREATE DATABASE nexos_db');
            console.log('✅ Base de datos "nexos_db" creada exitosamente');
        }

        await client.end();
        console.log('\n🎉 ¡Listo! Ahora puedes ejecutar: npm run init-db\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n⚠️  PostgreSQL no está corriendo.');
            console.log('   Soluciones:');
            console.log('   1. Abre "Servicios" de Windows');
            console.log('   2. Busca "postgresql-x64-18"');
            console.log('   3. Click derecho → Iniciar\n');
        } else if (error.message.includes('password authentication failed')) {
            console.log('\n⚠️  La contraseña es incorrecta.');
            console.log('   Edita el archivo .env y cambia DB_PASSWORD\n');
        }
        
        process.exit(1);
    }
}

createDatabase();
