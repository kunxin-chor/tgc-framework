const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const flash = require('connect-flash');
const csurf = require('csurf');
const cors = require('cors');
require("dotenv").config();

// create an instance of express app
let app = express();

app.use(cors());

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);

// setup sessions
app.use(session({
  store: new FileStore(), // use files to store sessions
  secret:process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: true // create a session if the request does not have one
}));

app.use(flash());

// once csrf is enabled, it will be applied
// automatically to all POST requests
// if the post request does not have valid
// csrf token, it will be rejected
const csrfInstance = csurf();

// use a proxy middleware to check if to apply csrf to the requested route
app.use(function(req,res,next){
  if (req.url === "/checkout/process_payment" || req.url.slice(0,5)=="/api/") {
    // don't apply csrf
    return next();
  }
  // if not that excluded route, then apply csrf
  csrfInstance(req,res,next);
})

// how does middlewares handle errors
// if the middleware prior has an error, it will be forward to the
// next middleware
// such a middleware will have four arguments for its function
// and the first argument will be the err
app.use(function(err, req, res, next){
  if (err && err.code == "EBADCSRFTOKEN") {
    req.flash("error", "The form has expired. Please try again.")
    res.redirect('back'); // go back to the previous page
  } else {
    next();
  }
}) 


// we want a way to share the token
app.use(function(req,res,next){
  // share the csrf token with all hbs

  if (req.csrfToken) {
    res.locals.csrfToken = req.csrfToken();
  }
 
  next();
})

// custom middleware to extract the flash messages
app.use(function(req,res,next){
  // extract out the success_messages
  const successMessages = req.flash("success");
  const errorMessages = req.flash("error");
  // make the success_messages to all HBS files
  res.locals.success_messages = successMessages; // <-- all hbs file use access
  res.locals.error_messages = errorMessages;
  next();
})

// custom middleware to show the current logged in user
app.use(function(req,res,next){
  if (req.session.user) {
    res.locals.user = req.session.user;
  }

  next();
})

const landingRoutes = require('./routes/landing');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const cloudinaryRoutes = require('./routes/cloudinary');
const cartRoutes = require('./routes/shoppingCart');

const api = {
  products: require('./routes/api/products'),
  users: require('./routes/api/users')
}

async function main() {
    // register the landingRoutes router with express
    // for an URLS that begins with `/` only,
    // then use the landingRoutes router object
    app.use('/', landingRoutes);

    // for any URLS that begins with `/products`,
    // use the productRoutes router object
    app.use('/products', productRoutes);

    // regiser the user routes
    app.use('/users', userRoutes);

    // register the cloudinary route
    app.use('/cloudinary', cloudinaryRoutes);

    // register the shopping cart routes
    app.use('/cart', cartRoutes);

    // register the checkout routes
    app.use('/checkout', require('./routes/checkout'));

    // register API routes
    app.use('/api/products', express.json(), api.products);
    app.use('/api/users', express.json(), api.users);

  }

main();

app.listen(3000, () => {
  console.log("Server has started");
});