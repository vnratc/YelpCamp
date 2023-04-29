const Campground = require("./models/campground")
const Review = require("./models/review")
const { campgroundValidationSchema, reviewValidationSchema } = require("./joiSchemas.js") // Joi  schemas. We have to destructure because module.exports.campgroundValidationSchema is an object property
const ExpressError = require("./utils/ExpressError") // Error class


// Check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    // console.log("REQ.USER...", req.user) // req.user is retrieved from the session
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash("error", "You must be signed in!")
        return  res.redirect("/login")
    }
    next()
}


// Return to initially requested path after logging in
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo
    }
    next()
}


// Validate "New Campground" Form
module.exports.validateCampground = (req, res, next) => {
    // Call validation method and pass "req.body"
    const { error } = campgroundValidationSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else { next() }
}


// Validate "New Review" Form
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewValidationSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else { next() }
}


// Make sure only authors can edit and delete
module.exports.isCampAuthor = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "Not Authorized to edit this campground")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}


// Make sure only reviewAuthor can delete it
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId).populate("author")
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "Not Authorized to delete this review")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}