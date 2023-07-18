// Add variables from ".env" file to "process.env".
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}


// Express.
const express = require("express")
const app = express()
// Prevent MongoDB Operator Injection.
const mongoSanitize = require('express-mongo-sanitize');

const path = require("path")
const mongoose = require("mongoose")

// Template engine.
const ejsMate = require("ejs-mate")
const session = require("express-session")
const flash = require("connect-flash")

// MongoDB Atlas
// const dbUrl = "mongodb://127.0.0.1:27017/yelp-camp"
const dbUrl = process.env.DB_URL


// Storing session in Mongo
// const MongoDBStore = require("connect-mongo")(session)
const MongoStore = require('connect-mongo');
const store = MongoStore.create({
    // mongoUrl: dbUrl,
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
} )


// Error class.
const ExpressError = require("./utils/ExpressError")

// Different request types.
const methodOverride = require("method-override")

const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user")


// Import routes.
const campgroundsRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews")
const userRoutes = require("./routes/users")



// Protect headers
const helmet = require("helmet");
const { options } = require("joi");


// Connect Mongoose database.
main()
    .then(() => console.log("Mongoose connection Open"))
    .catch(err => console.log("Mongoose connection Error", err))
async function main() {

    // "true" prevents information that is not in schema fields from being saved to the database, "false" allows it.
    mongoose.set('strictQuery', true)

    await mongoose.connect(dbUrl)
}


// Set a derictory for the application's views and a default engine to use.
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

// Register template engine.
app.engine("ejs", ejsMate)

// Import ability to extract form data (parse req.body)
app.use(express.urlencoded({ extended: true }))

// Add different request types
app.use(methodOverride("_method"))

// Static files. __dirname is required to be able run "nodemon app.js" from any working directory
app.use(express.static(path.join(__dirname, "public")))


// Use session.
const sessionConfig = {
    store,
    name: 'session',
    secret: "thisshouldbeabettersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 3600 * 24 * 7, // week
        maxAge: 1000 * 3600 * 24 * 7, // week
        httpOnly: true,
        // secure: true  // Require only https, not just http
    }
}
app.use(session(sessionConfig)) // This must be before passport.session


// Use passport.
app.use(passport.initialize())
app.use(passport.session()) // This must be after session()
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


// Use flash.
app.use(flash())


// DOES NOT WORK AS IN LECTURE. DISABLING Content-Security-Policy
app.use(helmet({ contentSecurityPolicy: false }))
// // List allowed sources for helmet
// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
// ];
// // This is the array that needs added to
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
//     "https://cdn.jsdelivr.net",
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com/",
//     "https://a.tiles.mapbox.com/",
//     "https://b.tiles.mapbox.com/",
//     "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// // Use helmet with allowed sources defined above
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/drzyxwo23/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//                 "https://images.unsplash.com/",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );

app.use(mongoSanitize({ replaceWith: 'kuku' }))

// Use local variables.
app.use((req, res, next) => { // THIS MUST BE BEFORE ROUTES

    // console.log(req.query)

    // .currentUser is now available in templates.
    res.locals.currentUser = req.user

    // .success is array that's available in templates
    res.locals.success = req.flash("success")

    // "res.locals" property sets variables accessible in templates rendered with res.render. The variables set on res.locals are available within a single request-response cycle.
    res.locals.error = req.flash("error")
    next()
})


// Use routes.
app.use("/campgrounds", campgroundsRoutes) // For :id to work we need to set 
app.use("/campgrounds/:id/reviews", reviewRoutes)
app.use("/", userRoutes)


// Home page.
app.get("/", (req, res) => {
    res.render("home")
})


// This will run ABSOLUTELY every time. Check for invalid routes.
app.all("*", (req, res, next) => {
    // Whatever arg is passed to "next(arg)" is passed to Error Handling Middleware as 1st arg, i.e. "err".
    next(new ExpressError("Page Not Found!!!", 404))
})


// Error handling.
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = "Oh NO! Something went TERRIBLY WROOOOONG!!!"
    req.flash("error", err.message)
    res.redirect("/campgrounds")
    // res.status(statusCode).render("error", { err }) // old way of showing error
})


// Start server.
app.listen(3000, () => {
    console.log("Listening on port 3000")
})






