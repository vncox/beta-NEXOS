const { sequelize } = require('../config/database');

// Importar modelos
const User = require('./User');
const Empresa = require('./Empresa');
const Subasta = require('./Subasta');
const Puja = require('./Puja');
const Rifa = require('./Rifa');
const BoletoRifa = require('./BoletoRifa');
const Producto = require('./Producto');
const Causa = require('./Causa');
const Donacion = require('./Donacion');
const Transaccion = require('./Transaccion');
const PasswordReset = require('./PasswordReset');

// ============================================
// RELACIONES ENTRE MODELOS
// ============================================

// Empresa - Subastas (Una empresa puede tener muchas subastas)
Empresa.hasMany(Subasta, { foreignKey: 'empresa_id', as: 'subastas' });
Subasta.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// Subasta - Pujas (Una subasta puede tener muchas pujas)
Subasta.hasMany(Puja, { foreignKey: 'subasta_id', as: 'pujas' });
Puja.belongsTo(Subasta, { foreignKey: 'subasta_id', as: 'subasta' });

// User - Pujas (Un usuario puede hacer muchas pujas)
User.hasMany(Puja, { foreignKey: 'usuario_id', as: 'pujas' });
Puja.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

// Subasta - Ganador (Una subasta puede tener un ganador)
Subasta.belongsTo(User, { foreignKey: 'ganador_id', as: 'ganador' });

// Empresa - Rifas (Una empresa puede tener muchas rifas)
Empresa.hasMany(Rifa, { foreignKey: 'empresa_id', as: 'rifas' });
Rifa.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// Rifa - Boletos (Una rifa tiene muchos boletos)
Rifa.hasMany(BoletoRifa, { foreignKey: 'rifa_id', as: 'boletos' });
BoletoRifa.belongsTo(Rifa, { foreignKey: 'rifa_id', as: 'rifa' });

// User - Boletos de Rifa (Un usuario puede comprar muchos boletos)
User.hasMany(BoletoRifa, { foreignKey: 'usuario_id', as: 'boletos' });
BoletoRifa.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

// Rifa - Ganador
Rifa.belongsTo(User, { foreignKey: 'ganador_id', as: 'ganador' });

// Empresa - Productos (Una empresa puede tener muchos productos)
Empresa.hasMany(Producto, { foreignKey: 'empresa_id', as: 'productos' });
Producto.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// Empresa - Causas (Una empresa puede gestionar muchas causas)
Empresa.hasMany(Causa, { foreignKey: 'empresa_id', as: 'causas' });
Causa.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// Causa - Donaciones (Una causa puede tener muchas donaciones)
Causa.hasMany(Donacion, { foreignKey: 'causa_id', as: 'donaciones' });
Donacion.belongsTo(Causa, { foreignKey: 'causa_id', as: 'causa' });

// User - Donaciones (Un usuario puede hacer muchas donaciones)
User.hasMany(Donacion, { foreignKey: 'usuario_id', as: 'donaciones' });
Donacion.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

// Transacciones de Usuarios
User.hasMany(Transaccion, { foreignKey: 'usuario_id', as: 'transacciones' });
Transaccion.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

// Transacciones de Empresas
Empresa.hasMany(Transaccion, { foreignKey: 'empresa_id', as: 'transacciones' });
Transaccion.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// Password Resets
User.hasMany(PasswordReset, { foreignKey: 'usuario_id', as: 'password_resets' });
PasswordReset.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

Empresa.hasMany(PasswordReset, { foreignKey: 'empresa_id', as: 'password_resets' });
PasswordReset.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// Aprobaciones (admin que aprobó empresa)
Empresa.belongsTo(User, { foreignKey: 'aprobada_por', as: 'aprobador' });

// ============================================
// EXPORTAR MODELOS Y SEQUELIZE
// ============================================

module.exports = {
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
    Transaccion,
    PasswordReset
};
