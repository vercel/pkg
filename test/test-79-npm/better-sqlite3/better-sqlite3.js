'use strict';

const db = require('better-sqlite3')('test-db.sqlite');

db.exec('CREATE TABLE IF NOT EXISTS cats ( name TEXT , age INTEGER )');

const insert = db.prepare('INSERT INTO cats (name, age) VALUES (@name, @age)');

const insertMany = db.transaction((cats) => {
  for (const cat of cats) insert.run(cat);
});

insertMany([
  { name: 'Joey', age: 2 },
  { name: 'Sally', age: 4 },
  { name: 'Junior', age: 1 },
]);
console.log('ok');
