const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../src/models');

async function testLogin() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos\n');
        
        const admin = await User.findOne({ where: { username: 'admin' } });
        
        if (!admin) {
            console.log('❌ Admin NO existe');
            process.exit(1);
        }
        
        console.log('📊 Datos del admin:');
        console.log('   Username:', admin.username);
        console.log('   Email:', admin.email);
        console.log('   Role:', admin.role);
        console.log('   Password hash:', admin.password.substring(0, 20) + '...');
        
        // Probar contraseña
        console.log('\n🔐 Probando contraseña "admin123"...');
        const isValid = await bcrypt.compare('admin123', admin.password);
        
        if (isValid) {
            console.log('✅ La contraseña ES CORRECTA\n');
        } else {
            console.log('❌ La contraseña NO ES VÁLIDA');
            console.log('\n🔧 Actualizando contraseña...');
            
            const newHash = await bcrypt.hash('admin123', 10);
            await admin.update({ password: newHash });
            
            console.log('✅ Contraseña actualizada exitosamente\n');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

testLogin();
