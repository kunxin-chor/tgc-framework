const express = require('express');
const { Product, Category, Tag } = require('../models');
const { createProductForm, bootstrapField } = require('../forms');
const async = require('hbs/lib/async');
const router = express.Router();


router.get('/', async (req,res)=>{


    // fetching from the database is asynchronous operation
    const products = await Product.collection().fetch({
        withRelated:['category'] // also fetch the category of each product
    });
    
    // we must remember to convert the result to JSON
    // if we want it as an array of plain objects
    // without all meta-data
    res.render('products/index', {
        products: products.toJSON()
    });
    
});

router.get('/add-product', async (req,res)=>{

    // fetch all possible categories from the database
    const allCategories = await Category.fetchAll().map( c => [c.get('id'), c.get('name')]);

    // fetch all possible tags from the database
    const allTags = await Tag.fetchAll().map( t => [t.get('id'), t.get('name')])

    const form = createProductForm(allCategories, allTags);
    res.render('products/create',{
        form: form.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/add-product', async (req,res)=>{

    // fetch all possible categories from the databasae
    const allCategories = await Category.fetchAll().map( c => [c.get('id'), c.get('name')]);
    
     // fetch all possible tags from the database
     const allTags = await Tag.fetchAll().map( t => [t.get('id'), t.get('name')])


    const form = createProductForm(allCategories, allTags);
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
            product.set('category_id', form.data.category_id);
            product.set('image_url', form.data.image_url);
            await product.save();

              // save to pivot table (AFTER THE PRODUCT HAS BEEN CREATED)
              if (form.data.tags) {
                // if the user selects at least one tag then we associate
                // those tags with the product
                await product.tags().attach(form.data.tags.split(','));
            }

            // a flash message is saved to the session data
            req.flash("success", "New product has been created successfully!");
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

router.get('/:product_id/update', async (req,res)=>{
    // retrieve the product we are editing
    const productId = req.params.product_id;
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true,
        withRelated:['tags'] // fetch all the associated tags information
     });

     // fetch all possible categories from the databasae
     const allCategories = await Category.fetchAll().map( c => [c.get('id'), c.get('name')]);

     // fetch all possible tags from the database
     const allTags = await Tag.fetchAll().map( t => [t.get('id'), t.get('name')])


    const form = createProductForm(allCategories, allTags);
    form.fields.name.value = product.get('name');
    form.fields.cost.value = product.get('cost');
    form.fields.description.value = product.get('description');
    form.fields.category_id.value = product.get('category_id');

    // we need to get all the id of the tags that the product is associated with
    const selectedTags = await product.related('tags').pluck('id');
    form.fields.tags.value = selectedTags;

    res.render('products/update', {
        form: form.toHTML(bootstrapField)
    })


})

router.post('/:product_id/update', async(req,res)=>{
     // fetch all possible categories from the databasae
     const allCategories = await Category.fetchAll().map( c => [c.get('id'), c.get('name')]);
    const form = createProductForm(allCategories);
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true,
        withRelated:['tags']
    });

    form.handle(req, {
        'success': async (form)=>{
            // update the product
            // by giving it an object
            // so each key in form.data will be updated into the row
            // for this to work, all the object's keys must match a column in the row
            
            let {tags, ...productData} = form.data
            product.set(productData); 
            await product.save();

            // sync the tags
            // get all the existing tags
            const existingTags = await product.related('tags').pluck('id');
            // remove all the existing tags
            await product.tags().detach(existingTags);
            // add the tags that are selected in the form
            await product.tags().attach(form.data.tags.split(','))

            res.redirect('/products');
        },
        'error': async (form)=>{
            res.render('products/update',{
                form: form.toHTML(bootstrapField),
                product: product.toJSON()
            })
        },
        'empty':async(form)=>{
            res.render('products/update',{
                form: form.toHTML(bootstrapField),
                product: product.toJSON()
            })
        }
    })
})

router.get('/:product_id/delete', async(req,res)=>{
    const productId = req.params.product_id;
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true
    });

    res.render('products/delete',{
        product: product.toJSON()
    })

});

router.post("/:product_id/delete", async(req,res)=>{
     // retrieve the product we are editing
     const productId = req.params.product_id;
     const product = await Product.where({
         'id': productId
     }).fetch({
         require: true
     });
     await product.destroy();
     res.redirect('/products')
})

module.exports = router;