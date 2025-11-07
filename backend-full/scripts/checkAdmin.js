const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../src/models');

async function checkAndCreateAdmin() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos');
        
        // Verificar si existe admin
        const admin = await User.findOne({ where: { username: 'admin' } });
        
        if (admin) {
            console.log('\n✅ Usuario admin YA EXISTE:');
            console.log('   ID:', admin.id);
            console.log('   Username:', admin.username);
            console.log('   Email:', admin.email);
            console.log('   Role:', admin.role);
            console.log('\n📝 Credenciales:');
            console.log('   Usuario: admin');
            console.log('   Contraseña: admin123\n');
            process.exit(0);
        }
        
        console.log('\n⚠️  Admin NO existe, creando...');
        
        // Crear admin
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const newAdmin = await User.create({
            username: 'admin',
            password: hashedPassword,
            email: 'admin@nexos.cl',
            nombre: 'Administrador',
            apellido: 'Sistema',
            rut: '11111111-1',
            telefono: '+56900000000',
            role: 'admin',
            saldo: 0,
            activo: true,
            verificado: true
        });
        
        console.log('\n✅ Usuario admin CREADO exitosamente:');
        console.log('   ID:', newAdmin.id);
        console.log('   Username:', newAdmin.username);
        console.log('   Email:', newAdmin.email);
        console.log('   Role:', newAdmin.role);
        console.log('\n📝 Credenciales de acceso:');
        console.log('   Usuario: admin');
        console.log('   Contraseña: admin123\n');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

checkAndCreateAdmin();
