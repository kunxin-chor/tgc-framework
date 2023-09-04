const express = require('express');
const router = express.Router();

const cloudinary = require('cloudinary');
cloudinary.config({
    'api_secret': process.env.CLOUDINARY_API_SECRET,
    'api_key':process.env.CLOUDINARY_API_KEY
})

router.get('/sign', (req,res)=>{
    // retrieve the paramers to sign (we assume req.query.params_to_sign is a JSON string)
    console.log(req.query.params_to_sign);
    const params_to_sign = req.query.params_to_sign;

    const signature = cloudinary.utils.api_sign_request(params_to_sign, process.env.CLOUDINARY_API_SECRET);
    res.send(signature);
})

module.exports = router;