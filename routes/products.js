const express = require('express');
const { Product, Category, Tag } = require('../models');
const { createProductForm, bootstrapField, createSearchForm } = require('../forms');
const { getAllCategories, getAllTags, getProductByID, createProduct } = require('../dal/products');
const router = express.Router();


router.get('/', async (req, res) => {

    // fetch all possible categories from the database
    const allCategories = await getAllCategories();
    allCategories.unshift([0, '---------']);

    // fetch all possible tags from the database
    const allTags = await getAllTags();

    const searchForm = createSearchForm(allCategories, allTags);

    searchForm.handle(req, {
        'success': async (form) => {
            // create our base query via the query builder
            const q = Product.collection(); // same "SELECT * FROM products WHERE 1"
            if (form.data.name) {
                // add the where clause to the query so far
                q.where('name', 'like', '%' + form.data.name + '%');
            }
            if (form.data.category_id && form.data.category_id!='0') {
                q.where('category_id', '=', form.data.category_id)
            }
            if (form.data.min_cost) {
                q.where('cost', '>=', form.data.min_cost);
            }
            if (form.data.max_cost) {
                q.where('cost', '<=', form.data.max_cost);
            }
            if (form.data.tags) {
                q.query('join', 'products_tags', 'products.id', 'products_tags.product_id')
                    .where('tag_id', 'in', form.data.tags.split(','));

            }

            const products = await q.fetch({
                withRelated:['category', 'tags']
            })
         
            res.render('products/index',{
                products: products.toJSON(),
                searchForm: form.toHTML(bootstrapField)
            })
        },
        'error': async (form) => {
            // fetching from the database is asynchronous operation
            const products = await Product.collection().fetch({
                withRelated: ['category'] // also fetch the category of each product
            });

            // we must remember to convert the result to JSON
            // if we want it as an array of plain objects
            // without all meta-data
            res.render('products/index', {
                products: products.toJSON(),
                searchForm: searchForm.toHTML(bootstrapField)
            });

        },
        'empty': async (form) => {
            // fetching from the database is asynchronous operation
            const products = await Product.collection().fetch({
                withRelated: ['category'] // also fetch the category of each product
            });

            // we must remember to convert the result to JSON
            // if we want it as an array of plain objects
            // without all meta-data
            res.render('products/index', {
                products: products.toJSON(),
                searchForm: searchForm.toHTML(bootstrapField)
            });
        }
    })

});

router.get('/add-product', async (req, res) => {

    // fetch all possible categories from the database
    const allCategories = await getAllCategories();

    // fetch all possible tags from the database
    const allTags = await getAllTags();

    const form = createProductForm(allCategories, allTags);
    res.render('products/create', {
        form: form.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/add-product', async (req, res) => {

    // fetch all possible categories from the databasae
    const allCategories = await getAllCategories();

    // fetch all possible tags from the database
    const allTags = await getAllTags();


    const form = createProductForm(allCategories, allTags);
    form.handle(req, {
        "success": async (form) => {
            // no error in the form
            // we want to create the new product
            // if we are referring to the entire MODEL
            // then it is eqv to referring to the entire TABLE
            // if we are referring to one OBJECT based on the MODEL
            // then we are referring to ONE ROW in the table

            // create a new Product model instance
            // (it will refer to a new row)
            const product = await createProduct(form.data);

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
        "error": (form) => {
            // there is error in the form
            res.render('products/create', {
                form: form.toHTML(bootstrapField),
                cloudinaryName: process.env.CLOUDINARY_NAME,
                cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
            })
        },
        "empty": (form) => {
            // the form is empty
            res.render('products/create', {
                form: form.toHTML(bootstrapField),
                cloudinaryName: process.env.CLOUDINARY_NAME,
                cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
            })
        }
    })
})

router.get('/:product_id/update', async (req, res) => {
    // retrieve the product we are editing
   
    const product = await getProductByID(req.params.product_id);

    // fetch all possible categories from the databasae
    const allCategories = await getAllCategories();

    // fetch all possible tags from the database
    const allTags = await Tag.fetchAll().map(t => [t.get('id'), t.get('name')])


    const form = createProductForm(allCategories, allTags);
    form.fields.name.value = product.get('name');
    form.fields.cost.value = product.get('cost');
    form.fields.description.value = product.get('description');
    form.fields.category_id.value = product.get('category_id');
    form.fields.image_url.value = product.get('image_url');

    // we need to get all the id of the tags that the product is associated with
    const selectedTags = await product.related('tags').pluck('id');
    form.fields.tags.value = selectedTags;

    res.render('products/update', {
        form: form.toHTML(bootstrapField),
        product: product.toJSON(),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })


})

router.post('/:product_id/update', async (req, res) => {
    // fetch all possible categories from the databasae
    const allCategories = await getAllCategories();
    const form = createProductForm(allCategories);
    const product = await getProductByID(req.params.product_id);

    form.handle(req, {
        'success': async (form) => {
            // update the product
            // by giving it an object
            // so each key in form.data will be updated into the row
            // for this to work, all the object's keys must match a column in the row

            let { tags, ...productData } = form.data
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
        'error': async (form) => {
            res.render('products/update', {
                form: form.toHTML(bootstrapField),
                product: product.toJSON(),
                cloudinaryName: process.env.CLOUDINARY_NAME,
                cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
            })
        },
        'empty': async (form) => {
            res.render('products/update', {
                form: form.toHTML(bootstrapField),
                product: product.toJSON(),
                cloudinaryName: process.env.CLOUDINARY_NAME,
                cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
            })
        }
    })
})

router.get('/:product_id/delete', async (req, res) => {
    const productId = req.params.product_id;
    const product = await getProductByID(productId);
    res.render('products/delete', {
        product: product.toJSON()
    })

});

router.post("/:product_id/delete", async (req, res) => {
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