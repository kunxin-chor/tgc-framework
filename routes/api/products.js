const express = require('express');
const { getAllProducts, getAllCategories, getAllTags, createProduct } = require('../../dal/products');
const { createProductForm } = require('../../forms');
const router = express.Router();

router.get('/', async(req,res)=>{
    const products = await getAllProducts();
    res.json({
        'products': products.toJSON()
    })
})

// POST api/products
router.post('/', async(req,res)=>{
    const allCategories = await getAllCategories();
    const allTags = await getAllTags();
    const form = createProductForm(allCategories, allTags);
    form.handle(req,{
        'success': async(form) => {
            const product = await createProduct(form.data);
            res.json(product);
        },
        'error': async(form) => {
            let errors = {};
            for (let key in form.fields) {
                if (form.fields[key].error) {
                    errors[key] = form.fields[key].error;
                }
            }
            res.json(errors);
        },
        'empty': async(form) => {
            res.status(400);
            res.json({
                'error':"Form is empty"
            })
        }
    })
} )

module.exports = router;