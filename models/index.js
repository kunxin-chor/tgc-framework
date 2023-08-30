const bookshelf = require('../bookshelf');

// the first parameter to bookshelf.model()
// is the NAME of the model. The name of the
// variable that we assign it to is of no
// consquence
//
// In the config object, tableName is which
// table the model is associated with
const Product = bookshelf.model('Product',{
    tableName:"products",

    // add a new relationship
    // EACH RELATIONSHIP IS REPRESENTED VIA A FUNCTION
    // THE NAME OF THE RELATIONSHIP IS THE FUNCTION NAME
    // The relationship name if it is referring to one instance, has to be singular
    category() {
        // the firs parameter of belongsTo must be the NAME OF THE MODEL
        // the NAME of the MODEL is the one paraemter in `bookshelf.model`
        // one instance (row) of product belongs to one instance (row) in the categories table
        return this.belongsTo('Category')
    },
    // the name of the relationship is 'tags'
    tags() {
        return this.belongsToMany('Tag');
    }
});

// the model name should always be SINGULAR (for bookshelf to work)
const Category = bookshelf.model('Category',{
    tableName:"categories",

    // relationship name here is plural BECAUSE one category can have many products
    // again - the name of the relationship is the lower case form of the model name
    products() {
        return this.hasMany('Product'); // use the MODEL NAME for the `products` table
    }
})

const Tag = bookshelf.model('Tag',{
    tableName: 'tags',
    products() {
        return this.belongsToMany('Product')
    }
})

const User = bookshelf.model('User', {
    tableName: 'users'
})

module.exports = { Product, Category, Tag, User };