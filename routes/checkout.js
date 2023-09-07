const express = require('express');
const router = express.Router();
const cartServices = require('../services/carts');
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

router.get('/', async (req, res) => {
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
                'currency': "SGD",
                'unit_amount': i.related('product').get('cost'),  // cost are integers in Stripe (cents)
                'product_data': {
                    'name': i.related('product').get('name'),
                    'metadata': {
                        'product_id': i.get('product_id')
                    }
                }
            }
        }

        if (i.related('product').get('image_url')) {
            lineItem.price_data.product_data.images = [i.related('product').get('image_url')]
        }

        lineItems.push(lineItem);
    }

    // 2. create the payment 
    const payment = {
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        success_url: "https://www.google.com",
        cancel_url: "https://www.yahoo.com",
    }

    // 3. pass the payment info to stripe to create a payment session 
    const stripeSession = await Stripe.checkout.sessions.create(payment);
    res.render('checkout/index', {
        payment_url: stripeSession.url
    })
})

// WEBHOOK FOR RECEIVING PAYMENTS FROM STRIPE
router.post('/process_payment', express.raw({ type: 'application/json' }), async (req, res) => {
    const payload = req.body;
    console.log("/process_payment");
    // make sure that it is Stripe that is calling this endpoint
    const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

    const sigHeader = req.headers['stripe-signature'];

    // the event object will store the information if the signature matches
    let event;
    
    try {
        // verify that the request is actually from Stripe
        // and is actually meant for our website
        event = Stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);

        // send a success to Stripe to notify that the endpoint has been 
        // called successful
        res.json({
            recieved: true
        })

    } catch (e) {
        res.json({
            'error': e.message
        });
        console.log(e.message);
    }

    if (event.type == "checkout.session.completed") {
        const stripeSession = event.data.object;
        console.log(stripeSession);
        // TODO: Store the stripe session in your database for vendor management
    }

})

module.exports = router;