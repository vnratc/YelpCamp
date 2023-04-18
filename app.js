// Imports & Settings


// Initializing Express
const express = require("express")
const app = express()
const path = require("path")
// Requiring models
const Campground = require("./models/campground")
const Review = require("./models/review")
// Add different request types
const methodOverride = require("method-override")
// Registering a template engine
const ejsMate = require("ejs-mate")
// Require error wrapping function
const catchAsync = require("./utils/catchAsync")
// Import error class
const ExpressError = require("./utils/ExpressError")
// Joi  schema
// We have to destructure because module.exports.campgroundValidationSchema is an object property
const { campgroundValidationSchema, reviewValidationSchema } = require("./joiSchemas.js")


// Requiring and connecting Mongoose
const mongoose = require("mongoose")
main()
    .then(() => console.log("Mongoose connection Open"))
    .catch(err => console.log("Mongoose connection Error", err))
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp")
}


// Middleware


// Setting a derictory for the application's views and a default engine to use
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
// Registering a template engine
app.engine("ejs", ejsMate)
// Import ability to extract form data (parse req.body)
app.use(express.urlencoded({ extended: true }))
// Add different request types
app.use(methodOverride("_method"))


// Form Validations
const validateCampground = (req, res, next) => {
    // Call validation method and pass "req.body"
    const { error } = campgroundValidationSchema.validate(req.body)

    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else { next() }
}

const validateReview = (req, res, next) => {
    const { error } = reviewValidationSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else { next() }
}


// View routes


// Home page
app.get("/", (req, res) => {
    res.render("home")
})


// New // Render form // It HAS to be above all "/:id" routes to work 
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new")
})
// Create
// We add Middleware to route handlers by adding it as an argument after the route.
// catchAsync takes function as argument, runs it with ".catch(next)" and returns it 
app.post("/campgrounds", validateCampground, catchAsync(async (req, res, next) => {
    // try{
    // // .campground because form names are "campground[title]...", i.e. we store form names in additional object
    // if(!req.body.campground) throw new ExpressError("Invalid Campground Data", 400)

    // Mongoose code
    const newCampground = new Campground(req.body.campground)
    await newCampground.save()
    res.redirect(`/campgrounds/${newCampground._id}`)
}))
// } catch(e){
//     // Whe we catch error, "next" calls the Error Handling middleware defined below, right before "app.listen"
//     next(e)
// }


// Show all // Read
app.get("/campgrounds", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
}))
// Show one 
app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("reviews")
    res.render("campgrounds/show", { campground })
}))


// Edit // Render form
app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/edit", { campground })
}))
// Update
app.put("/campgrounds/:id/", validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    // .campground because form names are "campground[title]...", i.e. we store form names in additional object
    const updatedCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${updatedCampground._id}`)
}))


// Delete
app.delete("/campgrounds/:id/delete", catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    res.redirect("/campgrounds")
}))


// Create Review
app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async (req, res) => {
    const { rating, body } = req.body.review
    const review = new Review({ rating, body })
    const { id } = req.params
    const campground = await Campground.findById(id)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))


// Delete Review
app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    // $pull is mongo operator
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))


// This will run ABSOLUTELY every time. Check for invalid routes.
app.all("*", (req, res, next) => {
    // Whatever arg is passed to "next(arg)" is passed to Error Handling Middleware as 1st arg, i.e. "err".
    next(new ExpressError("Page Not Found!!!", 404))
})


// Error handling
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = "Oh NO! Something went TERRIBLY WROOOOONG!!!"
    res.status(statusCode).render("error", { err })
})


// Starting server
app.listen(3000, () => {
    console.log("Listening on port 3000")
})