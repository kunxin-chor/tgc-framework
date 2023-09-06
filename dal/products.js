const {Category, Tag, Product} = require('../models');

const getAllCategories = async () =>{
    const allCategories = await Category.fetchAll().map(c => [c.get('id'), c.get('name')]);
    return allCategories;
}

const getAllTags = async() => {
    const allTags = await Tag.fetchAll().map(t => [t.get('id'), t.get('name')]);
    return allTags;
}

const getProductByID = async(productId) => {
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true,
        withRelated: ['tags', 'category'] // fetch all the associated tags information
    });
    return product;
}

const createProduct = async(productData) => {
    const product = new Product();
    product.set('name', productData.name);
    product.set('cost', productData.cost);
    product.set('description', productData.description);
    product.set('category_id', productData.category_id);
    product.set('image_url', productData.image_url);
    await product.save();
    return product;

}

module.exports = {
    getAllCategories, getAllTags, getProductByID, createProduct
}