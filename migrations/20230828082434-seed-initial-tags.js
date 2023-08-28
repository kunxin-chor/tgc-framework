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

exports.up = async function(db) {
  // seeding means setting up the initial data so that
  // we don't have to keep re-entering them on a fresh database
  await db.insert('tags', ['name'], ['Vegan'] );
  await db.insert('tags', ['name'], ['Glutten-Free'] );
  await db.insert('tags', ['name'], ['Organic'] );
  return db.insert('tags', ['name'], ['Fibre Rich'] );
};

exports.down = function(db) {
  return db.query("DELETE FROM tags")
};

exports._meta = {
  "version": 1
};
