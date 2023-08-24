'use strict';

const { DEC8_BIN } = require("mysql/lib/protocol/constants/charsets");

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
  return db.addColumn('products', 'description', {
    'type':'text'
  })
};

exports.down = function(db) {
  return db.removeColumn('products', 'description');
};

exports._meta = {
  "version": 1
};
