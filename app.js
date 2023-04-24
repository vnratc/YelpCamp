const express = require("express") // Express
const app = express()
const path = require("path")
const mongoose = require("mongoose")
const ejsMate = require("ejs-mate") // Template engine
const session = require("express-session")
const flash = require("connect-flash")
const ExpressError = require("./utils/ExpressError") // Error class
const methodOverride = require("method-override") // Different request types
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user")


const campgroundsRoutes = require("./routes/campgrounds") // Routes
const reviewRoutes = require("./routes/reviews")
const userRoutes = require("./routes/users")


main()
    .then(() => console.log("Mongoose connection Open"))
    .catch(err => console.log("Mongoose connection Error", err))
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp")
}


app.set("views", path.join(__dirname, "views")) // Setting a derictory for the application's views and a default engine to use
app.set("view engine", "ejs")
app.engine("ejs", ejsMate) // Registering a template engine
app.use(express.urlencoded({ extended: true })) // Import ability to extract form data (parse req.body)
app.use(methodOverride("_method")) // Add different request types
app.use(express.static(path.join(__dirname, "public"))) // Static files. __dirname is required to be able run "nodemon app.js" from any working directory


const sessionConfig = {
    secret: "thisshouldbeabettersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 3600 * 24 * 7, // week
        maxAge: 1000 * 3600 * 24 * 7, // week
        httpOnly: true
    }
}
app.use(session(sessionConfig)) // This must be before passport.session


app.use(passport.initialize())
app.use(passport.session()) // This must be after session()
passport.use(new LocalStrategy(User.authenticate()))


passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use(flash())
app.use((req, res, next) => { // THIS MUST BE BEFORE ROUTES
    res.locals.success = req.flash("success") // .success is array that's available in templates
    res.locals.error = req.flash("error")
    next()
})


app.use("/campgrounds", campgroundsRoutes) // Routes. For :id to work we need to set 
app.use("/campgrounds/:id/reviews", reviewRoutes)
app.use("/", userRoutes)


// Home page
app.get("/", (req, res) => {
    res.render("home")
})


// This will run ABSOLUTELY every time. Check for invalid routes.
app.all("*", (req, res, next) => {
    // Whatever arg is passed to "next(arg)" is passed to Error Handling Middleware as 1st arg, i.e. "err".
    next(new ExpressError("Page Not Found!!!", 404))
})


// Error handling
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = "Oh NO! Something went TERRIBLY WROOOOONG!!!"
    req.flash("error", err.message)
    res.redirect("/campgrounds")
    // res.status(statusCode).render("error", { err }) // old way of showing error
})


// Starting server
app.listen(3000, () => {
    console.log("Listening on port 3000")
})






