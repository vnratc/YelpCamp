const express = require("express")
const router = express.Router({ mergeParams: true }) // { mergeParams: true } is for params be available in this file
const catchAsync = require("../utils/catchAsync") // Error wrapping function
const ExpressError = require("../utils/ExpressError") // Error class
const Campground = require("../models/campground") // Models
const Review = require("../models/review")
const { reviewValidationSchema } = require("../joiSchemas.js") // Joi schema. We have to destructure because module.exports.campgroundValidationSchema is an object property


// Form Validations
const validateReview = (req, res, next) => {
    const { error } = reviewValidationSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else { next() }
}


// Create
router.post("/", validateReview, catchAsync(async (req, res) => {
    const { rating, body } = req.body.review
    const review = new Review({ rating, body })
    const { id } = req.params
    const campground = await Campground.findById(id)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash("success", "Your review was successfully posted")
    res.redirect(`/campgrounds/${campground._id}`)
}))


// Delete
router.delete("/:reviewId", catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    // $pull is mongo operator
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash("success", "Review was deleted")
    res.redirect(`/campgrounds/${id}`)
}))


module.exports = router