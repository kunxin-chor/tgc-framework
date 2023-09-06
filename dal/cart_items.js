const { CartItem } = require('../models')

const getCart = async (userId) => {
    return await CartItem.collection()
        .where({ 'user_id': userId })
        .fetch({
            'require': false,
            'withRelated': ['product', 'product.category']
        })

}

const createCartItem = async (userId, productId, quantity) => {
    const cartItem = new CartItem({
        user_id: userId,
        product_id: productId,
        quantity: quantity
    });
    await cartItem.save();
    return cartItem;
}

const getCartItemByUserAndProduct = async (userId, productId) => {
    return await CartItem.where({
        'user_id': userId,
        'product_id': productId
    }).fetch({
        require: false
    })
}

const updateQuantity = async (cartItem = null, userId = null, productId = null, newQuantity = null) => {


    if (!cartItem) {
        cartItem = await getCartItemByUserAndProduct(userId, productId);
    }

    if (cartItem) {
        console.log("new quantity=", newQuantity);
        // if cartItem exists, then just update the cart item
        cartItem.set('quantity', newQuantity);
        await cartItem.save();
    }

}

const removeFromCart = async (userId, productId) => {
    const cartItem = await getCartItemByUserAndProduct(userId, productId);
    await cartItem.destroy();

}

module.exports = {
    getCart, createCartItem, getCartItemByUserAndProduct, updateQuantity, getCart, removeFromCart
}