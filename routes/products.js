const express = require('express');
const router = express.Router();

router.get('/', (req,res)=>{
    res.send("Show all products");
});

router.get('/add-product', (req,res)=>{
    res.send("Add a new product");
})

module.exports = router;