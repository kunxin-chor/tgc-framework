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
    res.send(cartItem);
})

module.exports = router;