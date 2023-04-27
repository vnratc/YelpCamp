const express = require("express")
const router = express.Router({ mergeParams: true }) // { mergeParams: true } is for params be available in this file
const catchAsync = require("../utils/catchAsync") // Error wrapping function
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js")
const reviews = require("../controllers/reviews")


// This is similar to Django urls.py "path("login", views.login_view, name="login")"


// Create review
router.post("/",
    isLoggedIn,
    validateReview,
    catchAsync(reviews.createReview))


// Delete review
router.delete("/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    catchAsync(reviews.deleteReview))


module.exports = router