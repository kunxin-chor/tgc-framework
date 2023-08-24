const express = require('express');
const { Product } = require('../models');
const router = express.Router();


router.get('/', async (req,res)=>{
    // fetching from the database is asynchronous operation
    const products = await Product.collection().fetch();
    
    // we must remember to convert the result to JSON
    // if we want it as an array of plain objects
    // without all meta-data
    res.render('products/index', {
        products: products.toJSON()
    });
});

router.get('/add-product', (req,res)=>{
    res.send("Add a new product");
})

module.exports = router;