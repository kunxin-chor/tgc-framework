'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  // Associate the two columns together
  // from `products.category_id` to `categories.id`

  // arguments
  // 1. the table that has the foregin key
  // 2. the table that the foreign key will refer to
  // 3. the name of the foreign key (every FK must have a unique name in the database)
  // 4. object that states which two columns associate with
  return db.addForeignKey('products', 'categories', 'products_categories_fk', {
    "category_id": "id"
  }, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT"
  })
};

exports.down = function (db) {
  return db.removeForeignKey("products", "product_categories_fk");
};

exports._meta = {
  "version": 1
};
