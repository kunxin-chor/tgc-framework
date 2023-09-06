const express = require('express');
const router = express.Router();
const cartServiceLayer = require('../services/carts')
const { checkIfAuthenticated } = require('../middlewares');

router.get('/', [checkIfAuthenticated], async(req,res)=>{
    const allCartItems = await cartServiceLayer.getCart(req.session.user.id);
    return res.render('cart/index',{
        allCartItems:allCartItems.toJSON()
    })
})

router.post('/:product_id/add', [checkIfAuthenticated],  async(req,res)=>{
    const cartItem = await cartServiceLayer.addToCart(
        req.session.user.id,
        req.params.product_id,
        1
    );
    req.flash('success', "Item added to cart");
    res.redirect("/cart");
})

router.post('/:product_id/updateQuantity', [checkIfAuthenticated], async(req,res)=>{
    const newQuantity = req.body.newQuantity;
    await cartServiceLayer.updateCartItemQuantity(req.session.user.id,
         req.params.product_id, 
         newQuantity);
    req.flash('success', 'Item quantity updated');
    res.redirect('/cart');
})

router.post('/:product_id/delete', [checkIfAuthenticated], async(req,res)=>{
    await cartServiceLayer.removeFromCart(req.session.user.id, req.params.product_id);
    req.flash("success", "Item removed from cart");
    res.redirect("/cart");
})

module.exports = router;