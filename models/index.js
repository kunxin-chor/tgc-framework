const bookshelf = require('../bookshelf');

// the first parameter to bookshelf.model()
// is the NAME of the model. The name of the
// variable that we assign it to is of no
// consquence
//
// In the config object, tableName is which
// table the model is associated with
const Product = bookshelf.model('Product',{
    tableName:"products"
});

module.exports = { Product };