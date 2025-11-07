require('dotenv').config();
const {
    sequelize,
    User,
    Empresa,
    Subasta,
    Puja,
    Rifa,
    BoletoRifa,
    Producto,
    Causa,
    Donacion,
    Transaccion
} = require('../src/models');

async function seedDatabase() {
    try {
        console.log('­ƒî▒ Iniciando seed de base de datos...');

        await sequelize.authenticate();
        console.log('Ô£à Conexi├│n establecida');

        // Verificar si ya hay datos
        const userCount = await User.count();
        if (userCount > 1) { // M├ís que admin
            console.log('\nÔÜá´©Å  La base de datos ya tiene datos de prueba.');
            console.log('   Para volver a poblar, ejecuta primero: npm run init-db\n');
            process.exit(0);
        }

        // ============================================
        // USUARIOS DE PRUEBA
        // ============================================
        console.log('\n­ƒöä Creando usuarios de prueba...');

        const users = await User.bulkCreate([
            {
                username: 'juan_perez',
                password: 'password123',
                email: 'juan@example.com',
                nombre: 'Juan',
                apellido: 'Pérez',
                rut: '12345678-9',
                telefono: '+56912345678',
                saldo: 50000,
                role: 'user'
            },
            {
                username: 'maria_gonzalez',
                password: 'password123',
                email: 'maria@example.com',
                nombre: 'María',
                apellido: 'González',
                rut: '23456789-0',
                telefono: '+56923456789',
                saldo: 75000,
                role: 'user'
            },
            {
                username: 'pedro_silva',
                password: 'password123',
                email: 'pedro@example.com',
                nombre: 'Pedro',
                apellido: 'Silva',
                rut: '34567890-1',
                telefono: '+56934567890',
                saldo: 100000,
                role: 'user'
            }
        ], { individualHooks: true }); // Para que se ejecuten los hooks de hash de password

        console.log(`Ô£à ${users.length} usuarios creados`);

        // ============================================
        // EMPRESAS DE PRUEBA
        // ============================================
        console.log('\n­ƒöä Creando empresas de prueba...');

        const empresas = await Empresa.bulkCreate([
            {
                username: 'tech_store',
                password: 'password123',
                email: 'contacto@techstore.cl',
                razon_social: 'Tech Store SpA',
                rut: '76123456-7',
                giro: 'Venta de tecnología',
                telefono: '+56987654321',
                direccion: 'Av. Providencia 123, Santiago',
                sitio_web: 'https://techstore.cl',
                descripcion: 'Tu tienda de tecnología de confianza',
                saldo: 500000,
                estado: 'aprobada',
                role: 'empresa'
            },
            {
                username: 'arte_galeria',
                password: 'password123',
                email: 'info@artegaleria.cl',
                razon_social: 'Arte & Galería Ltda',
                rut: '76234567-8',
                giro: 'Galería de arte',
                telefono: '+56976543210',
                direccion: 'Lastarria 456, Santiago',
                sitio_web: 'https://artegaleria.cl',
                descripcion: 'Arte contemporáneo y clásico',
                saldo: 300000,
                estado: 'aprobada',
                role: 'empresa'
            },
            {
                username: 'fundacion_esperanza',
                password: 'password123',
                email: 'contacto@fundacionesperanza.cl',
                razon_social: 'Fundación Esperanza',
                rut: '76345678-9',
                giro: 'Fundación sin fines de lucro',
                telefono: '+56965432109',
                direccion: 'Las Condes 789, Santiago',
                sitio_web: 'https://fundacionesperanza.cl',
                descripcion: 'Ayudando a quienes más lo necesitan',
                saldo: 0,
                estado: 'aprobada',
                role: 'empresa'
            }
        ], { individualHooks: true });

        console.log(`Ô£à ${empresas.length} empresas creadas`);

        // ============================================
        // SUBASTAS DE PRUEBA
        // ============================================
        console.log('\n­ƒöä Creando subastas de prueba...');

        const ahora = new Date();
        const en7Dias = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);

        const subastas = await Subasta.bulkCreate([
            {
                empresa_id: empresas[0].id,
                titulo: 'iPhone 14 Pro Max 256GB',
                descripcion: 'iPhone 14 Pro Max en perfectas condiciones, color Space Black, 256GB de almacenamiento. Incluye caja original y accesorios.',
                tipo: 'producto',
                imagenes: ['/images/iphone14.jpg'],
                precio_inicial: 500000,
                precio_actual: 500000,
                precio_reserva: 800000,
                incremento_minimo: 10000,
                fecha_inicio: ahora,
                fecha_fin: en7Dias,
                categoria: 'Electrónica',
                etiquetas: ['smartphone', 'apple', 'iphone'],
                destacada: true,
                estado: 'activa'
            },
            {
                empresa_id: empresas[0].id,
                titulo: 'MacBook Pro M2 16" 1TB',
                descripcion: 'MacBook Pro con chip M2, pantalla de 16 pulgadas, 1TB SSD, 16GB RAM. Ideal para profesionales creativos.',
                tipo: 'producto',
                imagenes: ['/images/macbook.jpg'],
                precio_inicial: 1200000,
                precio_actual: 1200000,
                incremento_minimo: 50000,
                fecha_inicio: ahora,
                fecha_fin: en7Dias,
                categoria: 'Computación',
                etiquetas: ['laptop', 'apple', 'macbook'],
                destacada: true,
                estado: 'activa'
            },
            {
                empresa_id: empresas[1].id,
                titulo: 'Pintura Original "Atardecer en Los Andes"',
                descripcion: 'Obra original al óleo sobre lienzo, 80x120cm. Artista: María Fernández. Incluye certificado de autenticidad.',
                tipo: 'arte',
                imagenes: ['/images/pintura1.jpg'],
                precio_inicial: 300000,
                precio_actual: 300000,
                precio_reserva: 500000,
                incremento_minimo: 20000,
                fecha_inicio: ahora,
                fecha_fin: en7Dias,
                categoria: 'Arte',
                etiquetas: ['pintura', 'oleo', 'paisaje'],
                destacada: false,
                estado: 'activa'
            }
        ]);

        console.log(`Ô£à ${subastas.length} subastas creadas`);

        // ============================================
        // PUJAS DE PRUEBA
        // ============================================
        console.log('\n­ƒöä Creando pujas de prueba...');

        const pujas = await Puja.bulkCreate([
            {
                subasta_id: subastas[0].id,
                usuario_id: users[0].id,
                monto: 510000,
                automatica: false,
                estado: 'activa'
            },
            {
                subasta_id: subastas[0].id,
                usuario_id: users[1].id,
                monto: 520000,
                automatica: false,
                estado: 'activa'
            },
            {
                subasta_id: subastas[1].id,
                usuario_id: users[2].id,
                monto: 1250000,
                automatica: false,
                estado: 'activa'
            }
        ]);

        // Actualizar precio actual de subastas
        await subastas[0].update({ precio_actual: 520000, cantidad_pujas: 2 });
        await subastas[1].update({ precio_actual: 1250000, cantidad_pujas: 1 });

        console.log(`Ô£à ${pujas.length} pujas creadas`);

        // ============================================
        // RIFAS DE PRUEBA
        // ============================================
        console.log('\n­ƒöä Creando rifas de prueba...');

        const en14Dias = new Date(ahora.getTime() + 14 * 24 * 60 * 60 * 1000);

        const rifas = await Rifa.bulkCreate([
            {
                empresa_id: empresas[0].id,
                titulo: 'Rifa PlayStation 5 + 2 Juegos',
                descripcion: 'Participa por una PlayStation 5 Digital Edition más dos juegos AAA a elección. Sorteo el próximo mes.',
                imagenes: ['/images/ps5.jpg'],
                precio_boleto: 5000,
                boletos_totales: 1000,
                boletos_vendidos: 347,
                fecha_sorteo: en14Dias,
                categoria: 'Gaming',
                etiquetas: ['ps5', 'gaming', 'consola'],
                destacada: true,
                estado: 'activa'
            },
            {
                empresa_id: empresas[1].id,
                titulo: 'Rifa Set de Arte Profesional',
                descripcion: 'Set completo de pinceles profesionales, óleos, lienzos y caballete. Valor comercial $200.000.',
                imagenes: ['/images/set-arte.jpg'],
                precio_boleto: 3000,
                boletos_totales: 500,
                boletos_vendidos: 156,
                fecha_sorteo: en14Dias,
                categoria: 'Arte',
                etiquetas: ['arte', 'pintura', 'pinceles'],
                destacada: false,
                estado: 'activa'
            }
        ]);

        console.log(`Ô£à ${rifas.length} rifas creadas`);

        // ============================================
        // BOLETOS DE RIFA
        // ============================================
        console.log('\n­ƒöä Creando boletos de rifa de prueba...');

        const boletos = [];
        for (let i = 1; i <= 10; i++) {
            boletos.push({
                rifa_id: rifas[0].id,
                usuario_id: users[i % 3].id,
                numero: i,
                estado: 'vendido',
                fecha_compra: ahora
            });
        }

        await BoletoRifa.bulkCreate(boletos);
        console.log(`Ô£à ${boletos.length} boletos creados`);

        // ============================================
        // PRODUCTOS DE PRUEBA
        // ============================================
        console.log('\n­ƒöä Creando productos de prueba...');

        const productos = await Producto.bulkCreate([
            {
                empresa_id: empresas[0].id,
                nombre: 'Gorra NEXOS Edición Limitada',
                descripcion: 'Gorra ajustable con logo bordado NEXOS, 100% algodón premium.',
                precio: 15990,
                stock: 50,
                stock_inicial: 100,
                imagenes: ['/images/gorra.jpg'],
                categoria: 'Ropa',
                sku: 'NXS-GOR-001',
                etiquetas: ['gorra', 'merchandising', 'nexos'],
                destacado: true,
                estado: 'disponible'
            },
            {
                empresa_id: empresas[0].id,
                nombre: 'Camiseta NEXOS Original',
                descripcion: 'Camiseta de algodón con diseño exclusivo NEXOS. Disponible en tallas S, M, L, XL.',
                precio: 19990,
                stock: 75,
                stock_inicial: 150,
                imagenes: ['/images/camiseta.jpg'],
                categoria: 'Ropa',
                sku: 'NXS-CAM-001',
                etiquetas: ['camiseta', 'merchandising', 'nexos'],
                destacado: true,
                estado: 'disponible'
            },
            {
                empresa_id: empresas[0].id,
                nombre: 'Taza NEXOS Cerámica Premium',
                descripcion: 'Taza de cerámica premium de 350ml con logo NEXOS. Apta para microondas y lavavajillas.',
                precio: 8990,
                stock: 100,
                stock_inicial: 200,
                imagenes: ['/images/taza.jpg'],
                categoria: 'Hogar',
                sku: 'NXS-TAZ-001',
                etiquetas: ['taza', 'merchandising', 'nexos'],
                destacado: true,
                estado: 'disponible'
            }
        ]);

        console.log(`Ô£à ${productos.length} productos creados`);

        // ============================================
        // CAUSAS DE PRUEBA
        // ============================================
        console.log('\n­ƒöä Creando causas de prueba...');

        const causas = await Causa.bulkCreate([
            {
                empresa_id: empresas[2].id,
                titulo: 'Alimentos para Familias Vulnerables',
                descripcion: 'Campaña para proporcionar alimentos básicos a 100 familias en situación de vulnerabilidad.',
                historia: 'Muchas familias en nuestra comuna enfrentan dificultades para acceder a alimentación básica. Con tu ayuda podemos marcar la diferencia.',
                meta_recaudacion: 5000000,
                monto_recaudado: 2350000,
                fecha_inicio: ahora,
                fecha_fin: en14Dias,
                categoria: 'Alimentación',
                etiquetas: ['alimentos', 'familias', 'ayuda'],
                verificada: true,
                destacada: true,
                total_donantes: 47,
                estado: 'activa'
            },
            {
                empresa_id: empresas[2].id,
                titulo: 'Becas Escolares 2024',
                descripcion: 'Ayuda a niños y niñas a continuar sus estudios con útiles escolares y uniformes.',
                historia: 'La educación es un derecho. Ayúdanos a que ningún niño se quede sin estudiar por falta de recursos.',
                meta_recaudacion: 3000000,
                monto_recaudado: 890000,
                fecha_inicio: ahora,
                fecha_fin: en14Dias,
                categoria: 'Educación',
                etiquetas: ['educacion', 'niños', 'becas'],
                verificada: true,
                destacada: false,
                total_donantes: 23,
                estado: 'activa'
            }
        ]);

        console.log(`Ô£à ${causas.length} causas creadas`);

        // ============================================
        // DONACIONES DE PRUEBA
        // ============================================
        console.log('\n­ƒöä Creando donaciones de prueba...');

        const donaciones = await Donacion.bulkCreate([
            {
                causa_id: causas[0].id,
                usuario_id: users[0].id,
                monto: 50000,
                anonimo: false,
                mensaje: '¡Excelente iniciativa! Espero ayudar.',
                metodo_pago: 'mercadopago',
                estado: 'completada'
            },
            {
                causa_id: causas[0].id,
                usuario_id: users[1].id,
                monto: 30000,
                anonimo: true,
                mensaje: '',
                metodo_pago: 'mercadopago',
                estado: 'completada'
            },
            {
                causa_id: causas[1].id,
                usuario_id: users[2].id,
                monto: 25000,
                anonimo: false,
                mensaje: 'Por la educación de nuestros niños',
                metodo_pago: 'mercadopago',
                estado: 'completada'
            }
        ]);

        console.log(`Ô£à ${donaciones.length} donaciones creadas`);

        // ============================================
        // RESUMEN
        // ============================================
        console.log('\n' + '='.repeat(50));
        console.log('Ô£à BASE DE DATOS POBLADA EXITOSAMENTE');
        console.log('='.repeat(50));
        console.log(`­ƒæÑ Usuarios: ${users.length}`);
        console.log(`­ƒÅó Empresas: ${empresas.length}`);
        console.log(`­ƒö¿ Subastas: ${subastas.length}`);
        console.log(`­ƒÆ░ Pujas: ${pujas.length}`);
        console.log(`­ƒÄ▓ Rifas: ${rifas.length}`);
        console.log(`­ƒÄ½ Boletos: ${boletos.length}`);
        console.log(`­ƒôª Productos: ${productos.length} (Gorra, Camiseta, Taza)`);
        console.log(`ÔØñ´©Å  Causas: ${causas.length}`);
        console.log(`­ƒÄü Donaciones: ${donaciones.length}`);
        console.log('='.repeat(50));
        console.log('\n­ƒôØ Credenciales de prueba:');
        console.log('   Usuarios:');
        console.log('   - juan_perez / password123');
        console.log('   - maria_gonzalez / password123');
        console.log('   - pedro_silva / password123');
        console.log('\n   Empresas:');
        console.log('   - tech_store / password123');
        console.log('   - arte_galeria / password123');
        console.log('   - fundacion_esperanza / password123');
        console.log('\n');

        process.exit(0);
    } catch (error) {
        console.error('ÔØî Error al poblar base de datos:', error);
        process.exit(1);
    }
}

seedDatabase();
