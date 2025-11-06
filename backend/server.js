/**
 * Backend para Mercado Pago - Nexos
 * Modo SANDBOX (Sin dinero real)
 * 
 * Este servidor maneja la creación de preferencias de pago
 * y procesa las notificaciones (webhooks) de Mercado Pago
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5500',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// CONFIGURACIÓN DE MERCADO PAGO (SANDBOX)
// ============================================
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: { timeout: 5000 }
});

const preference = new Preference(client);
const payment = new Payment(client);

console.log('🔧 Mercado Pago configurado en modo SANDBOX');
console.log('💡 Las transacciones NO usarán dinero real');

// ============================================
// ENDPOINT: Crear preferencia de pago
// ============================================
app.post('/api/create-preference', async (req, res) => {
    try {
        const { tipo, itemId, monto, cantidad, titulo, descripcion, metadata } = req.body;

        console.log('📝 Creando preferencia de pago:', { tipo, itemId, monto, titulo });

        // Crear objeto de preferencia según la documentación de Mercado Pago
        const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
        
        const preferenceData = {
            items: [
                {
                    id: itemId.toString(),
                    title: titulo || 'Compra en Nexos',
                    description: descripcion || '',
                    quantity: parseInt(cantidad) || 1,
                    unit_price: parseFloat(monto),
                    currency_id: 'CLP'
                }
            ],
            back_urls: {
                success: `${frontendUrl}/pago-exitoso.html`,
                failure: `${frontendUrl}/pago-fallido.html`,
                pending: `${frontendUrl}/pago-pendiente.html`
            },
            // auto_return NO funciona con localhost - el usuario debe hacer click en "Volver al sitio"
            // auto_return: 'approved',
            payment_methods: {
                excluded_payment_methods: [],
                excluded_payment_types: [],
                installments: 1
            },
            metadata: {
                tipo: tipo,
                item_id: itemId,
                ...metadata
            },
            statement_descriptor: 'NEXOS',
            external_reference: `${tipo}-${itemId}-${Date.now()}`,
            expires: false
        };

        // Crear la preferencia en Mercado Pago
        const response = await preference.create({ body: preferenceData });

        console.log('✅ Preferencia creada:', response.id);

        // Retornar la preferencia al frontend
        res.json({
            success: true,
            preferenceId: response.id,
            initPoint: response.init_point, // URL para redirección
            sandboxInitPoint: response.sandbox_init_point // URL para sandbox
        });

    } catch (error) {
        console.error('❌ Error al crear preferencia:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// ENDPOINT: Webhook (Notificaciones de MP)
// ============================================
app.post('/api/webhook', async (req, res) => {
    try {
        const { type, data } = req.body;

        console.log('🔔 Webhook recibido:', { type, data });

        // Solo procesar notificaciones de pagos
        if (type === 'payment') {
            const paymentId = data.id;

            // Obtener información del pago
            const paymentData = await payment.get({ id: paymentId });

            console.log('💳 Información del pago:', {
                id: paymentData.id,
                status: paymentData.status,
                amount: paymentData.transaction_amount,
                metadata: paymentData.metadata
            });

            // Aquí puedes procesar el pago según su estado
            if (paymentData.status === 'approved') {
                console.log('✅ Pago aprobado:', paymentData.id);
                // Actualizar base de datos, enviar emails, etc.
            } else if (paymentData.status === 'rejected') {
                console.log('❌ Pago rechazado:', paymentData.id);
            }
        }

        // Siempre responder 200 a los webhooks
        res.sendStatus(200);

    } catch (error) {
        console.error('❌ Error en webhook:', error);
        res.sendStatus(500);
    }
});

// ============================================
// ENDPOINT: Obtener información de un pago
// ============================================
app.get('/api/payment/:id', async (req, res) => {
    try {
        const paymentId = req.params.id;
        const paymentData = await payment.get({ id: paymentId });

        res.json({
            success: true,
            payment: paymentData
        });

    } catch (error) {
        console.error('❌ Error al obtener pago:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// ENDPOINT: Verificar estado del servidor
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        mode: 'SANDBOX',
        message: 'Backend de Mercado Pago funcionando (SIN DINERO REAL)',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 Servidor backend iniciado');
    console.log('🌐 URL:', `http://localhost:${PORT}`);
    console.log('🔐 Modo: SANDBOX (Sin dinero real)');
    console.log('💳 Mercado Pago: Configurado');
    console.log('='.repeat(60));
    console.log('\n📝 Endpoints disponibles:');
    console.log(`   POST   /api/create-preference  - Crear preferencia de pago`);
    console.log(`   POST   /api/webhook            - Recibir notificaciones`);
    console.log(`   GET    /api/payment/:id        - Obtener info de pago`);
    console.log(`   GET    /api/health             - Estado del servidor`);
    console.log('\n💡 Para probar pagos, usa las tarjetas de prueba:');
    console.log('   https://www.mercadopago.cl/developers/es/docs/testing/test-cards');
    console.log('='.repeat(60) + '\n');
});
