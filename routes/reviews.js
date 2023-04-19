const express = require("express")
// { mergeParams: true } is for params be available in this file
const router = express.Router({ mergeParams: true })
// Error wrapping function
const catchAsync = require("../utils/catchAsync")
// Error class
const ExpressError = require("../utils/ExpressError")
// Models
const Campground = require("../models/campground")
const Review = require("../models/review")
// Joi  schema. We have to destructure because module.exports.campgroundValidationSchema is an object property
const { reviewValidationSchema } = require("../joiSchemas.js")


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