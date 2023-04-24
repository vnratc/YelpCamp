const express = require("express")
const router = express.Router({ mergeParams: true })
const passport = require("passport")
const User = require("../models/user")
const catchAsync = require("../utils/catchAsync") // Error wrapping function
// No need for validation function, passport is doing it for us


// Create // Form
router.get("/register", (req, res) => {
    res.render("users/register")
})


// New
router.post("/register", catchAsync(async (req, res) => {
    try {
    const { email, username, password } = req.body
    const user = new User({ email, username })
    const registeredUser = await User.register(user, password)
    console.log(registeredUser)
    req.flash("success", "Welcome to Yelp Camp")
    res.redirect("/campgrounds")
    } catch(e) {
        req.flash("error", e.message)
        res.redirect("register")
    }
}))


// Form
router.get("/login", (req, res) => {
    res.render("users/login")
})


// Login logic
router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login"}), (req, res) => {
    req.flash("success", "Welcome back!")
    res.redirect("/campgrounds")
})


// Logout
router.get("/logout", (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err) }
        req.flash("success", "You were logged out")
        res.redirect("/campgrounds")
    })
})


module.exports = router


// EXAMPLE OF HOW TO REGISTER A USER
// app.get("/fakeUser", async (req, res) => {
//     const user = new User({ email: "user@mail.com", username: "user" })
//     const newUser = await User.register(user, "chicken")
//     res.send(newUser)
// })