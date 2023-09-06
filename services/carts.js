const cartDataLayer = require('../dal/cart_items')

const getCart = async(userId) =>{
    return await cartDataLayer.getCart(userId);
}

const addToCart = async (userId, productId, quantity) => {

    // if the user already have the product in the cart
    // just increases its quantity by 1
    let  cartItem = await cartDataLayer.getCartItemByUserAndProduct(userId, productId);
    if (cartItem) {
        // add 1 to the quantity
        let newQuantity = cartItem.get('quantity')+1;
        await cartDataLayer.updateQuantity(cartItem=cartItem, userId=null, productId=null, newQuantity=newQuantity);
    } else {
        return await cartDataLayer.createCartItem(userId, productId, quantity);
    }
}

const updateCartItemQuantity = async (userId, productId, newQuantity) => {
    await cartDataLayer.updateQuantity(cartItem=null, userId=userId, productId=productId, newQuantity=newQuantity);
}

const removeFromCart = async(userId, productId) => {
    await cartDataLayer.removeFromCart(userId, productId);
}

module.exports = {addToCart, getCart, updateCartItemQuantity, removeFromCart};