'use strict';

var sequelize = require('sequelize');
if (typeof sequelize.and !== 'function') return;

var Dialect1 = require('sequelize/lib/dialects/mariadb');
var db1 = new Dialect1({ config: {}, options: { dialect: 'mariadb' } });
var cm1 = db1.connectionManager;
if (typeof cm1.lib.createConnection !== 'function') return;

var Dialect2 = require('sequelize/lib/dialects/mssql');
var db2 = new Dialect2({ config: {}, options: { dialect: 'mssql' } });
var cm2 = db2.connectionManager;
if (typeof cm2.lib.Connection !== 'function') return;

var Dialect3 = require('sequelize/lib/dialects/mysql');
var db3 = new Dialect3({ config: {}, options: { dialect: 'mysql' } });
var cm3 = db3.connectionManager;
if (typeof cm3.lib.createConnection !== 'function') return;

var Dialect4 = require('sequelize/lib/dialects/postgres');
var db4 = new Dialect4({ config: {}, options: { dialect: 'postgres' } });
var cm4 = db4.connectionManager;
if (typeof cm4.lib.Connection !== 'function') return;

var Dialect5 = require('sequelize/lib/dialects/sqlite');
var db5 = new Dialect5({ config: {}, options: { dialect: 'sqlite' } });
var cm5 = db5.connectionManager;
if (typeof cm5.lib.Database !== 'function') return;

console.log('ok');
