const express = require('express');
const router = express.Router();
const cartServices = require('../services/carts');
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

router.get('/', async(req,res)=>{
    // 1. we need to create line items (one line item represents one thing the user is paying for)
    const cartItems = await cartServices.getCart(req.session.user.id);
    const lineItems = [];  // store all the line items

    // create one line item for each item in the shopping cart
    for (let i of cartItems) {
        // represents one line item
        // have to follow the specifications given by Stripe
        const lineItem = {
            "quantity": i.get('quantity'),
            "price_data": {
                'currency':"SGD",
                'unit_amount':i.related('product').get('cost'),  // cost are integers in Stripe (cents)
                'product_data': {
                    'name': i.related('product').get('name'),
                    'metadata':{
                        'product_id': i.get('product_id')
                    }
                }
            }
        }

        if (i.related('product').get('image_url')) {
            lineItem.price_data.product_data.images = [ i.related('product').get('image_url')]
        }

        lineItems.push(lineItem);
    }

    // 2. create the payment 
    const payment = {
        payment_method_types:['card'],
        mode:'payment',
        line_items:lineItems,
        success_url:"https://www.google.com",
        cancel_url:"https://www.yahoo.com",
    }

    // 3. pass the payment info to stripe to create a payment session 
    const stripeSession = await Stripe.checkout.sessions.create(payment);
    res.render('checkout/index',{
        payment_url: stripeSession.url
    })
})  

module.exports = router;