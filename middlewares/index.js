const checkIfAuthenticated = (req,res, next) => {
    // is there a session with user data?
    if (req.session.user) {
        next(); // go on to the route
    } else {
        req.flash('error', "You must be logged in to access");
        res.redirect('/users/login');
    }
}

module.exports = {
    checkIfAuthenticated
}