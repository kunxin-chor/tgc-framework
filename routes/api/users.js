const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User, BlackListedToken } = require('../../models');
const { checkIfAuthenticatedWithJWT } = require('../../middlewares');

// we are assume user is a plain JSON object
const generateToken = (user, secret, expiry) => {
    // the first argument is the data (payload)
    // of the JWT: this is visible to the client
    // the second argument is token secret
    // the third argument is meta-data
    return jwt.sign({
        username: user.name,
        id: user.id,
        email: user.email
    }, secret, {
        expiresIn: expiry  // h=hour, s=sec, m=minutes, d=days, w=weeks
    })
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

router.post('/login', async (req, res) => {

    // 1. get the user by email and password
    const user = await User.where({
        'email': req.body.email,
        'password': getHashedPassword(req.body.password)
    }).fetch({
        require: false
    });

    if (user) {
        // user exists and can login
        const accessToken = generateToken(user.toJSON(), process.env.TOKEN_SECRET, "1h");
        const refreshToken = generateToken(user.toJSON(), process.env.REFRESH_TOKEN_SECRET, "1w");
        res.json({
            accessToken, refreshToken
        })

    } else {
        // user not found 
        res.sendStatus(403);
    }
})

router.post('/accessToken',  (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return res.sendStatus(400);
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, payload) => {
        if (err) {
            res.status(400);
            return res.json({
                err
            })
        } else {

            // check if the refresh token has been blacklisted or not
            const blacklistedToken = await BlackListedToken.where({
                token: refreshToken
            }).fetch({
                require: false
            });

            if (blacklistedToken) {
                res.status(400);
                return res.json({
                    'error':'Refresh token has been black listed'
                })
            }

            const accessToken = generateToken(payload, process.env.TOKEN_SECRET, "1h");
            res.json({
                accessToken
            });
        }
    })

})

router.delete('/refreshToken', async (req, res) => {

    jwt.verify(req.query.refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
       
        if (err) {
            return res.sendStatus(400);
        }
       
        // create a new BlacklistedToken model and save it
        const blackListedToken = new BlackListedToken({
            token: req.query.refreshToken,
            date_created: new Date()
        });
        blackListedToken.save();
        res.json({
            'success': "Token blacklisted"
        })


    })
})

router.get('/profile', [checkIfAuthenticatedWithJWT], (req, res) => {
    res.json(req.user);
})

module.exports = router;