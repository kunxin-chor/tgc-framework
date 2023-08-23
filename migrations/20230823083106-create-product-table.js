'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  /*
   CREATE TABLE products (
      id INT UNSIGN PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      cost INT,
   )
  */
 // first argument - name of the table
 // second arugment - object, the keys are the NAME of the columns
 // the VALUES are the definition of the column
  return db.createTable("products", {
    "id": {
      "type":"int",
      "primaryKey": true,
      "autoIncrement": true,
      "unsigned": true // positive numbers only
    },
    "name": {
      "type":"string",
      "length": 255,
      "notNull": true
    },
    "cost": "int"
  }) 
};

exports.down = function(db) {
  return db.dropTable("products");
};

exports._meta = {
  "version": 1
};
