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
  /* when creating a pivot table to use in Bookshelf,
  the table name should be the two tables' names combined together,
  in alphabetical order seperated by an underscore */
  return db.createTable('products_tags',{
    id: {
      type:'int',
      unsigned: true,
      autoIncrement: true,
      primaryKey: true
    },
    product_id:{
      type:'int',
      unsigned: true,
      notNull: true,
      foreignKey:{
        name:"products_tags_products_fk",
        table:'products',
        mapping:'id',
        rules:{
          onDelete:'CASCADE',
          onUpdate:'RESTRICT'
        }
      }
    },
    tag_id:{
      type:'int',
      unsigned: true,
      notNull:true,
      foreignKey:{
        name:"products_tags_tags_fk",
        table:'tags',
        mapping:'id',
        rules:{
          onDelete:'CASCADE',
          onUpdate:'RESTRICT'
        }
      }
    }
  });
};

exports.down = async function(db) {
  await db.removeForeignKey('products_tags', 'products_tags_products_fk');
  await db.removeForeignKey('products_tags', 'products_tags_tags_fk')
  return db.dropTable('products_tags');
};

exports._meta = {
  "version": 1
};
