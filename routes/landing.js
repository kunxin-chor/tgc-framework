const express = require('express');

// create a new router
// a router can store routes
const router = express.Router();

// the `index` route
router.get('/', (req,res)=>{
    res.render('landing/index')
})

router.get('/about-us', (req,res)=>{
    res.render('landing/about-us')
})

router.get("/contact-us", (req,res)=>{
    res.send("Contact Us")
})

module.exports = router;