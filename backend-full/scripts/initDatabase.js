require('dotenv').config();
const { sequelize, User, Empresa } = require('../src/models');

async function initDatabase() {
    try {
        console.log('🔄 Iniciando base de datos...');

        // Conectar
        await sequelize.authenticate();
        console.log('✅ Conexión establecida con PostgreSQL');

        // Sincronizar modelos (esto creará las tablas)
        console.log('🔄 Sincronizando modelos...');
        await sequelize.sync({ force: false }); // force: false no eliminará datos existentes
        console.log('✅ Modelos sincronizados');

        // Verificar si existe usuario admin
        const adminExists = await User.findOne({ where: { role: 'admin' } });

        if (!adminExists) {
            console.log('🔄 Creando usuario admin...');
            const admin = await User.create({
                username: 'admin',
                password: 'admin123', // Será hasheado automáticamente
                email: 'admin@nexos.cl',
                nombre: 'Administrador',
                apellido: 'Sistema',
                rut: '11111111-1',
                telefono: '+56912345678',
                role: 'admin',
                saldo: 0
            });
            console.log('✅ Usuario admin creado:', admin.username);
        } else {
            console.log('ℹ️  Usuario admin ya existe');
        }

        console.log('\n✅ Base de datos inicializada correctamente\n');
        console.log('📝 Credenciales de admin:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('\n⚠️  IMPORTANTE: Cambia la contraseña del admin después del primer login\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al inicializar base de datos:', error);
        process.exit(1);
    }
}

initDatabase();
