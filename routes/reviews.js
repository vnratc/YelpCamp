const express = require("express")
const router = express.Router({ mergeParams: true }) // { mergeParams: true } is for params be available in this file
const catchAsync = require("../utils/catchAsync") // Error wrapping function
const Campground = require("../models/campground") // Models
const Review = require("../models/review")
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js")



// Create
router.post("/", isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const review = new Review(req.body.review)
    review.author = req.user._id
    const { id } = req.params
    const campground = await Campground.findById(id)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash("success", "Your review was successfully posted")
    res.redirect(`/campgrounds/${campground._id}`)
}))


// Delete
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    // $pull is mongo operator
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash("success", "Review was deleted")
    res.redirect(`/campgrounds/${id}`)
}))


module.exports = router