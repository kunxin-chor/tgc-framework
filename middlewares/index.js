const jwt = require('jsonwebtoken');

const checkIfAuthenticated = (req,res, next) => {
    // is there a session with user data?
    if (req.session.user) {
        next(); // go on to the route
    } else {
        req.flash('error', "You must be logged in to access");
        res.redirect('/users/login');
    }
}

const checkIfAuthenticatedWithJWT = (req,res,next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        // in the header, the token will be provided in this syntax: "Bearer <TOKEN>"
        const token = authHeader.split(" ")[1];

        // the second argument of the callback function is the
        // token payload data
        jwt.verify(token, process.env.TOKEN_SECRET, function(err,user){
            if (err) {
                res.status(401);
                return res.json({
                    err
                });
            }
            // add a new key in the request object named 'user' to store
            // the user data

            req.user = user;
            next();
        })
    } else {
        res.sendStatus(401);
    }
}

module.exports = {
    checkIfAuthenticated, checkIfAuthenticatedWithJWT
}