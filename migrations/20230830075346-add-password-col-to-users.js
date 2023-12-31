'use strict';

const { string } = require("forms/lib/fields");

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
  return db.addColumn('users', 'password', {
    type:'string',
    length: 255,
    notNull: true
  });
};

exports.down = function(db) {
  return db.removeColumn('users', 'password');
};

exports._meta = {
  "version": 1
};
