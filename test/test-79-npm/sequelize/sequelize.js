let sequelize = require('sequelize');
if (typeof sequelize.and !== 'function') return;

let Dialect1 = require('sequelize/lib/dialects/mariadb');
let db1 = new Dialect1({ config: {}, options: { dialect: 'mariadb' } });
let cm1 = db1.connectionManager;
if (typeof cm1.lib.createConnection !== 'function') return;

let Dialect2 = require('sequelize/lib/dialects/mssql');
let db2 = new Dialect2({ config: {}, options: { dialect: 'mssql' } });
let cm2 = db2.connectionManager;
if (typeof cm2.lib.Connection !== 'function') return;

let Dialect3 = require('sequelize/lib/dialects/mysql');
let db3 = new Dialect3({ config: {}, options: { dialect: 'mysql' } });
let cm3 = db3.connectionManager;
if (typeof cm3.lib.createConnection !== 'function') return;

let Dialect4 = require('sequelize/lib/dialects/postgres');
let db4 = new Dialect4({ config: {}, options: { dialect: 'postgres' } });
let cm4 = db4.connectionManager;
if (typeof cm4.lib.Connection !== 'function') return;

let Dialect5 = require('sequelize/lib/dialects/sqlite');
let db5 = new Dialect5({ config: {}, options: { dialect: 'sqlite' } });
let cm5 = db5.connectionManager;
if (typeof cm5.lib.Database !== 'function') return;

console.log('ok');
