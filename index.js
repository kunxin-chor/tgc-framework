const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const flash = require('connect-flash');
require("dotenv").config();

// create an instance of express app
let app = express();

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
  secret:"keyboard cat",
  resave: false,
  saveUninitialized: true // create a session if the request does not have one
}));

app.use(flash());

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
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});