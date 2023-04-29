const User = require("../models/user")


module.exports.renderRegisterForm = (req, res) => {
    res.render("users/register")
}


module.exports.createAndLoginNewUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) { return next() }
            console.log(registeredUser)
            req.flash("success", "Welcome to Yelp Camp")
            res.redirect("/campgrounds")
        })
    } catch (e) {
        req.flash("error", e.message)
        res.redirect("register")
    }
}


module.exports.renderLoginForm = (req, res) => {
    res.render("users/login")
}


module.exports.login = (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}`)
    const redirectUrl = res.locals.returnTo || "/campgrounds"
    res.redirect(redirectUrl)
}


module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err) }
        req.flash("success", "You were logged out")
        res.redirect("/campgrounds")
    })
}


// EXAMPLE OF HOW TO REGISTER A USER
// app.get("/fakeUser", async (req, res) => {
//     const user = new User({ email: "user@mail.com", username: "user" })
//     const newUser = await User.register(user, "chicken")
//     res.send(newUser)
// })