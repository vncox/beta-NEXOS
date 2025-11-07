require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../src/models');

async function seedDatabase() {
    try {
        console.log('🌱 Iniciando seed de base de datos...');

        await sequelize.authenticate();
        console.log('✅ Conexión establecida');

        // Verificar si ya hay un admin
        const adminExists = await User.findOne({ where: { username: 'admin' } });
        if (adminExists) {
            console.log('\n✅ Usuario admin ya existe.');
            console.log('   Usuario: admin');
            console.log('   Contraseña: admin123\n');
            process.exit(0);
        }

        // ============================================
        // CREAR USUARIO ADMIN
        // ============================================
        console.log('\n🔄 Creando usuario administrador...');

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = await User.create({
            username: 'admin',
            password: hashedPassword,
            email: 'admin@nexos.cl',
            nombre: 'Administrador',
            apellido: 'Sistema',
            rut: '11111111-1',
            telefono: '+56900000000',
            saldo: 0,
            role: 'admin',
            activo: true,
            verificado: true
        });

        console.log('✅ Usuario admin creado exitosamente');

        console.log('\n' + '='.repeat(50));
        console.log('✅ BASE DE DATOS INICIALIZADA');
        console.log('='.repeat(50));
        console.log('\n� Credenciales de acceso:');
        console.log('   Usuario: admin');
        console.log('   Contraseña: admin123');
        console.log('\n' + '='.repeat(50) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al poblar base de datos:', error);
        process.exit(1);
    }
}

seedDatabase();
