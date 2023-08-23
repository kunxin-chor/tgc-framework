const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
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

const landingRoutes = require('./routes/landing');
const productRoutes = require('./routes/products');
async function main() {

// Example route
//   app.get('/', function(req,res){
//     // when we do res.render, it will by default
//     // look for the file in the `views` folder
//     // and the .hbs extension is optional
//     res.render('home.hbs', {
//         "name":"Tan Ah Kow",
//         "today_date":new Date()
//     });
//   })

// register the landingRoutes router with express
    
    // for an URLS that begins with `/` only,
    // then use the landingRoutes router object
    app.use('/', landingRoutes);

    // for any URLS that begins with `/products`,
    // use the productRoutes router object
    app.use('/products', productRoutes);
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});