const express = require("express")
const router = express.Router({ mergeParams: true }) // { mergeParams: true } is for params be available in "app.js" file
const catchAsync = require("../utils/catchAsync") // Error wrapping function
const Campground = require("../models/campground") // Models
const User = require("../models/user") // Models
const Review = require("../models/review")
const { isLoggedIn, isCampAuthor, validateCampground } = require("../middleware.js")


// Create
// Form // It HAS to be above all "/:id" routes to work 
router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new")
})


// We add Middleware to route handlers by adding it as an argument after the path.
// catchAsync takes function as argument, runs it with ".catch(next)" and returns it INSTEAD OF TRY / CATCH (see below)


// New 
router.post("/", isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const newCampground = new Campground(req.body.campground)
    newCampground.author = req.user._id
    await newCampground.save()
    req.flash("success", "Successfully created a new campground")
    res.redirect(`/campgrounds/${newCampground._id}`)
}))


// Read // Show all 
router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
}))


// Show one 
router.get("/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate("author")
        .populate({     // Populating review authors using "path" in an object
            path: "reviews",
            populate: {
                path: "author"
            }
        })
    // console.log("author: "+campground.author)
    if (!campground) {
        req.flash("error", "Can not find that campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { campground })
}))


// Update// Render form
router.get("/:id/edit", isLoggedIn, isCampAuthor, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash("error", "Can not find that campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { campground })
}))


// Edit 
router.put("/:id/", isLoggedIn, isCampAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    // .campground because form names are "campground[title]...", i.e. we store form names in additional object
    const updatedCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash("success", "Successfully updated the campground")
    res.redirect(`/campgrounds/${updatedCampground._id}`)
}))


// Delete
router.delete("/:id/delete", isLoggedIn, isCampAuthor, catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    req.flash("success", "Campground was deleted")
    res.redirect("/campgrounds")
}))


module.exports = router


// try{
// // .campground because form names are "campground[title]...", i.e. we store form names in additional object
// if(!req.body.campground) throw new ExpressError("Invalid Campground Data", 400)
// } catch(e){
//     // When we catch error, "next" calls the Error Handling middleware defined below, right before "app.listen"
//     next(e)
// }
