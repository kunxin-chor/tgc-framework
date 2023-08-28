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
  // follw this convention
  // 1. the table name MUST BE PLURAL
  // 2. the primary key MUST BE `id`
  // this is for Bookshelf to work efficently
  return db.createTable('categories', {
    id: {
      type:'int', unsigned: true, primaryKey: true, autoIncrement: true
    },
    name:{
      type: 'string', length: 100
    }
  })
};

exports.down = function(db) {
  return db.dropTable('categories');
};

exports._meta = {
  "version": 1
};
