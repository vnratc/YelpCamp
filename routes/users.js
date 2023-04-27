const express = require("express")
const router = express.Router({ mergeParams: true })
const passport = require("passport")
const catchAsync = require("../utils/catchAsync") // Error wrapping function
const { storeReturnTo } = require("../middleware")
const users = require("../controllers/users")
// No need for validation function, passport is doing it for us


// This is similar to Django urls.py "path("login", views.login_view, name="login")"


// Create
router.route("/register")
    .get(users.renderRegisterForm)   // Render Form
    .post(catchAsync(users.createAndLoginNewUser))  // Create new user


// Login
router.route("/login")   
    .get(users.renderLoginForm) // Login Form
    .post(  // Login logic
        storeReturnTo,
        passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }),
        users.login)


// Logout
router.get("/logout", users.logout)


module.exports = router


