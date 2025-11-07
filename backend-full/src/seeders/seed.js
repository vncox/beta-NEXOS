// Script para poblar la base de datos con datos de prueba
const db = require('../config/database');
const { User, Empresa, Subasta, Rifa, Producto, Causa } = require('../models');

async function seedDatabase() {
    try {
        console.log('🌱 Iniciando seed de la base de datos...');

        // 1. Crear empresa de prueba (si no existe)
        let empresaDemo = await Empresa.findOne({ where: { username: 'empresademo' } });
        if (!empresaDemo) {
            empresaDemo = await Empresa.create({
                username: 'empresademo',
                password: '$2a$10$wE5KkP8OmvOkJLfGh.2.rO0yVvP5NvqT.oQx9Y7kP0mP3vwO5JKXW', // password: demo123
                email: 'empresa@demo.com',
                razon_social: 'Empresa Demo S.A.',
                rut: '76.123.456-7',
                giro: 'Comercio general',
                telefono: '+56912345678',
                estado_aprobacion: 'aprobada',
                saldo: 50000000
            });
            console.log('✅ Empresa demo creada');
        }

        // 2. Crear usuarios de prueba
        let usuario1 = await User.findOne({ where: { username: 'usuario1' } });
        if (!usuario1) {
            usuario1 = await User.create({
                username: 'usuario1',
                password: '$2a$10$wE5KkP8OmvOkJLfGh.2.rO0yVvP5NvqT.oQx9Y7kP0mP3vwO5JKXW', // password: demo123
                email: 'usuario1@demo.com',
                nombre: 'Juan Pérez',
                telefono: '+56987654321',
                saldo: 100000
            });
            console.log('✅ Usuario1 creado');
        }

        let usuario2 = await User.findOne({ where: { username: 'usuario2' } });
        if (!usuario2) {
            usuario2 = await User.create({
                username: 'usuario2',
                password: '$2a$10$wE5KkP8OmvOkJLfGh.2.rO0yVvP5NvqT.oQx9Y7kP0mP3vwO5JKXW', // password: demo123
                email: 'usuario2@demo.com',
                nombre: 'María González',
                telefono: '+56911111111',
                saldo: 150000
            });
            console.log('✅ Usuario2 creado');
        }

        // 3. Crear subastas
        const subastas = [
            {
                empresa_id: empresaDemo.id,
                titulo: 'iPhone 14 Pro Max 256GB',
                descripcion: 'iPhone 14 Pro Max en perfectas condiciones. Color Morado Oscuro. Incluye caja original y accesorios. Sin ralladuras.',
                categoria: 'tecnologia',
                precio_inicial: 500000,
                precio_actual: 500000,
                precio_reserva: 800000,
                fecha_inicio: new Date(),
                fecha_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
                imagen: 'https://images.unsplash.com/photo-1678685888221-cda180f2c72e?w=500',
                estado: 'activa'
            },
            {
                empresa_id: empresaDemo.id,
                titulo: 'MacBook Air M2 2023',
                descripcion: 'MacBook Air con chip M2, 16GB RAM, 512GB SSD. Como nuevo, solo 2 meses de uso. Incluye funda protectora.',
                categoria: 'tecnologia',
                precio_inicial: 800000,
                precio_actual: 800000,
                precio_reserva: 1200000,
                fecha_inicio: new Date(),
                fecha_fin: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                imagen: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
                estado: 'activa'
            },
            {
                empresa_id: empresaDemo.id,
                titulo: 'PlayStation 5 + 3 Juegos',
                descripcion: 'PS5 Edición Standard con lector de discos. Incluye God of War Ragnarok, Spider-Man 2 y FIFA 24.',
                categoria: 'entretenimiento',
                precio_inicial: 400000,
                precio_actual: 450000,
                precio_reserva: 600000,
                fecha_inicio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                fecha_fin: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                imagen: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500',
                estado: 'activa'
            },
            {
                empresa_id: empresaDemo.id,
                titulo: 'Bicicleta de Montaña Trek',
                descripcion: 'Bicicleta Trek Marlin 7 2023. Aluminio, 29 pulgadas, 21 velocidades. Excelente estado.',
                categoria: 'deporte',
                precio_inicial: 300000,
                precio_actual: 320000,
                precio_reserva: 450000,
                fecha_inicio: new Date(),
                fecha_fin: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                imagen: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=500',
                estado: 'activa'
            }
        ];

        for (const subasta of subastas) {
            const existe = await Subasta.findOne({ where: { titulo: subasta.titulo } });
            if (!existe) {
                await Subasta.create(subasta);
                console.log(`✅ Subasta creada: ${subasta.titulo}`);
            }
        }

        // 4. Crear rifas
        const rifas = [
            {
                empresa_id: empresaDemo.id,
                titulo: 'Rifa: Nintendo Switch OLED',
                descripcion: 'Participa por una Nintendo Switch OLED nueva + 2 juegos a elección. Sorteo el 30 de enero 2025.',
                precio_boleto: 2000,
                boletos_totales: 500,
                boletos_vendidos: 127,
                fecha_sorteo: new Date('2025-01-30'),
                imagen: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500',
                estado: 'activa'
            },
            {
                empresa_id: empresaDemo.id,
                titulo: 'Rifa: Vale de $100.000 Falabella',
                descripcion: 'Gana un vale de compra por $100.000 para usar en Falabella.com o tiendas físicas.',
                precio_boleto: 1000,
                boletos_totales: 1000,
                boletos_vendidos: 445,
                fecha_sorteo: new Date('2025-02-15'),
                imagen: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500',
                estado: 'activa'
            },
            {
                empresa_id: empresaDemo.id,
                titulo: 'Rifa: Cena para 2 en Restaurante 5★',
                descripcion: 'Cena gourmet para dos personas en el exclusivo restaurante Boragó (3 estrellas Michelin).',
                precio_boleto: 3000,
                boletos_totales: 200,
                boletos_vendidos: 89,
                fecha_sorteo: new Date('2025-02-20'),
                imagen: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500',
                estado: 'activa'
            }
        ];

        for (const rifa of rifas) {
            const existe = await Rifa.findOne({ where: { titulo: rifa.titulo } });
            if (!existe) {
                await Rifa.create(rifa);
                console.log(`✅ Rifa creada: ${rifa.titulo}`);
            }
        }

        // 5. Crear productos
        const productos = [
            {
                empresa_id: empresaDemo.id,
                nombre: 'Polera Nexos Edición Limitada',
                descripcion: 'Polera de algodón 100% con logo de Nexos. Disponible en tallas S, M, L, XL.',
                categoria: 'ropa',
                precio: 15000,
                stock: 50,
                imagen: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
                destacado: true
            },
            {
                empresa_id: empresaDemo.id,
                nombre: 'Taza Nexos Cerámica Premium',
                descripcion: 'Taza de cerámica de alta calidad con diseño exclusivo de Nexos. Apta para microondas.',
                categoria: 'hogar',
                precio: 8000,
                stock: 100,
                imagen: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500',
                destacado: true
            },
            {
                empresa_id: empresaDemo.id,
                nombre: 'Gorra Nexos Snapback',
                descripcion: 'Gorra ajustable con bordado del logo. Material transpirable.',
                categoria: 'accesorios',
                precio: 12000,
                stock: 30,
                imagen: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500',
                destacado: false
            }
        ];

        for (const producto of productos) {
            const existe = await Producto.findOne({ where: { nombre: producto.nombre } });
            if (!existe) {
                await Producto.create(producto);
                console.log(`✅ Producto creado: ${producto.nombre}`);
            }
        }

        // 6. Crear causas
        const causas = [
            {
                empresa_id: empresaDemo.id,
                titulo: 'Ayuda a reconstruir escuelas en Maule',
                descripcion: 'Después de los incendios forestales de 2024, múltiples escuelas rurales quedaron destruidas. Tu aporte ayudará a reconstruir aulas y dotar de material educativo a más de 500 niños.',
                categoria: 'educacion',
                organizacion: 'Fundación Reconstruye Chile',
                meta_recaudacion: 5000000,
                monto_recaudado: 1250000,
                fecha_inicio: new Date(),
                fecha_fin: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                imagen: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500',
                estado: 'activa'
            },
            {
                empresa_id: empresaDemo.id,
                titulo: 'Operación de corazón para Martín',
                descripcion: 'Martín tiene 8 años y necesita una operación urgente al corazón. Su familia no cuenta con los recursos. Cada peso cuenta para salvar su vida.',
                categoria: 'salud',
                organizacion: 'Fundación Niño y Corazón',
                meta_recaudacion: 15000000,
                monto_recaudado: 8500000,
                fecha_inicio: new Date(),
                fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                imagen: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=500',
                estado: 'activa'
            },
            {
                empresa_id: empresaDemo.id,
                titulo: 'Protección del Bosque Nativo en Valdivia',
                descripcion: 'Proyecto de conservación de 500 hectáreas de bosque nativo. Protegeremos especies endémicas y restauraremos áreas degradadas.',
                categoria: 'medio-ambiente',
                organizacion: 'ONG Bosque Vivo',
                meta_recaudacion: 10000000,
                monto_recaudado: 3200000,
                fecha_inicio: new Date(),
                fecha_fin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                imagen: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=500',
                estado: 'activa'
            },
            {
                empresa_id: empresaDemo.id,
                titulo: 'Alimento y refugio para animales abandonados',
                descripcion: 'Nuestro refugio acoge a más de 200 perros y gatos rescatados de las calles. Necesitamos alimento, medicinas y mejorar las instalaciones.',
                categoria: 'animales',
                organizacion: 'Refugio Patitas Felices',
                meta_recaudacion: 3000000,
                monto_recaudado: 1800000,
                fecha_inicio: new Date(),
                fecha_fin: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                imagen: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=500',
                estado: 'activa'
            },
            {
                empresa_id: empresaDemo.id,
                titulo: 'Becas universitarias para jóvenes de escasos recursos',
                descripcion: 'Otorgamos becas completas para que jóvenes talentosos puedan acceder a educación superior. Ya hemos ayudado a 150 estudiantes.',
                categoria: 'educacion',
                organizacion: 'Fundación Futuro Brillante',
                meta_recaudacion: 20000000,
                monto_recaudado: 5600000,
                fecha_inicio: new Date(),
                fecha_fin: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
                imagen: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500',
                estado: 'activa'
            }
        ];

        for (const causa of causas) {
            const existe = await Causa.findOne({ where: { titulo: causa.titulo } });
            if (!existe) {
                await Causa.create(causa);
                console.log(`✅ Causa creada: ${causa.titulo}`);
            }
        }

        console.log('\n✅ Seed completado exitosamente!');
        console.log('\n📊 Resumen:');
        console.log(`   - Empresas: ${await Empresa.count()}`);
        console.log(`   - Usuarios: ${await User.count()}`);
        console.log(`   - Subastas: ${await Subasta.count()}`);
        console.log(`   - Rifas: ${await Rifa.count()}`);
        console.log(`   - Productos: ${await Producto.count()}`);
        console.log(`   - Causas: ${await Causa.count()}`);
        
        console.log('\n🔑 Credenciales de prueba:');
        console.log('   Admin: admin / admin123');
        console.log('   Empresa: empresademo / demo123');
        console.log('   Usuario1: usuario1 / demo123');
        console.log('   Usuario2: usuario2 / demo123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error en seed:', error);
        process.exit(1);
    }
}

// Ejecutar seed
seedDatabase();
