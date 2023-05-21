const Campground = require("../models/campground") // Models
const Review = require("../models/review")


// This is like "views.py" in Django where all the logic is wrtitten.


module.exports.createReview = async (req, res) => {
    const review = new Review(req.body.review)
    review.author = req.user._id
    const { id } = req.params
    const campground = await Campground.findById(id)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash("success", "Your review was successfully posted")
    res.redirect(`/campgrounds/${campground._id}`)
}


module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params
    // $pull is mongo (or mongoose) operator
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash("success", "Review was deleted")
    res.redirect(`/campgrounds/${id}`)
}