const express = require('express');
const { createUserForm, bootstrapField, createLoginForm } = require('../forms');
const { User } = require('../models');
const router = express.Router();
const crypto = require('crypto');
const { checkIfAuthenticated } = require('../middlewares');

const getHashedPassword = (password)=>{
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

router.get('/signup', (req, res) => {
    const form = createUserForm();
    res.render('users/signup', {
        form: form.toHTML(bootstrapField)
    })
})

router.post('/signup', (req, res) => {
    const form = createUserForm();
    form.handle(req, {
        success: async (form) => {
            // create a new instant of the user model == creating a new row in the users table
            const user = new User();
            user.set({
                name: form.data.name,
                password: getHashedPassword(form.data.password),
                email: form.data.email
            })
            await user.save();
            req.flash("success", "You have been registered");
            res.redirect('/users/login');
        },
        error: async (form) => {
            res.render('users/signup', {
                form: form.toHTML(bootstrapField)
            })
        },
        empty: async (form) => {
            res.render('users/signup', {
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/login', (req, res) => {
    const form = createLoginForm();
    res.render('users/login', {
        form: form.toHTML(bootstrapField)
    })
})

router.post('/login', (req, res) => {

    const form = createLoginForm();
    form.handle(req, {
        'success': async (form) => {
            // 1. attempt find the user in the database by the email address
            const user = await User.where({
                email:form.data.email,
                password: getHashedPassword(form.data.password)
            }).fetch({
                require: false
            });

            // 2. if the user exists, proceed to check the password
            if (user) {
                //  2b. if password success, login
                // add the user info to the session (req.sesson is the session belongo the current browser)
                req.session.user = {
                    id: user.get('id'),
                    email: user.get('email'),
                    name: user.get('name')
                }
                req.flash('success', "Login Successful!")
                res.redirect('/users/profile');
            } else {
                //  2c. else redirect with error
                req.flash('error', "Invalid login");
                res.redirect('/users/login');
            }
        }
    })


})

// if router.get/post/patch etc has THREE PARAMETERS
// 1. URL segment
// 2. an array of middleware functions
// 3. route function
router.get('/profile', [checkIfAuthenticated], (req,res)=>{
    const user = req.session.user;
    res.render('users/profile',{
      user
    })
})

router.get('/logout', [checkIfAuthenticated], (req,res)=>{
    req.session.user = null;
    req.flash('success', 'See you soon!');
    res.redirect('/users/login');
});

module.exports = router;