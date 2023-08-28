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
  // the name of the foreign key is the SINGULAR FORM of the other table in lower case, with _id at the back (for bookshelf to work efficently)
  return db.addColumn('products','category_id', {
    type:'int',
    unsigned: true,
    notNull: true
  });
};

exports.down = function(db) {
  return db.removeColumn('products', 'category_id');
};

exports._meta = {
  "version": 1
};
