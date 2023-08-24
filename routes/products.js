const express = require('express');
const { Product } = require('../models');
const { createProductForm, bootstrapField } = require('../forms');
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
    const form = createProductForm();
    res.render('products/create',{
        form: form.toHTML(bootstrapField)
    })
})

router.post('/add-product', (req,res)=>{
    const form = createProductForm();
    form.handle(req, {
        "success":async (form)=>{
            // no error in the form
            // we want to create the new product
            // if we are referring to the entire MODEL
            // then it is eqv to referring to the entire TABLE
            // if we are referring to one OBJECT based on the MODEL
            // then we are referring to ONE ROW in the table
            
            // create a new Product model instance
            // (it will refer to a new row)
            const product = new Product();
            product.set('name', form.data.name);
            product.set('cost', form.data.cost);
            product.set('description', form.data.description);
            await product.save();
            res.redirect('/products');
        
        },
        "error":(form)=>{
            // there is error in the form
            res.render('products/create', {
               form: form.toHTML(bootstrapField) 
            })
        },
        "empty":(form)=>{
            // the form is empty
            res.render('products/create', {
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

module.exports = router;