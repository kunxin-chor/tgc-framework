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

module.exports = {addToCart, getCart};