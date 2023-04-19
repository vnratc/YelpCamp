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
const { campgroundValidationSchema } = require("../joiSchemas.js")


// Form Validations
const validateCampground = (req, res, next) => {
    // Call validation method and pass "req.body"
    const { error } = campgroundValidationSchema.validate(req.body)

    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else { next() }
}


// Create
// Form // It HAS to be above all "/:id" routes to work 
router.get("/new", (req, res) => {
    res.render("campgrounds/new")
})
// We add Middleware to route handlers by adding it as an argument after the route.
// catchAsync takes function as argument, runs it with ".catch(next)" and returns it 

// New 
router.post("/", validateCampground, catchAsync(async (req, res, next) => {
    // try{
    // // .campground because form names are "campground[title]...", i.e. we store form names in additional object
    // if(!req.body.campground) throw new ExpressError("Invalid Campground Data", 400)
    const newCampground = new Campground(req.body.campground)
    await newCampground.save()
    req.flash("success", "Successfully created a new campground")
    res.redirect(`/campgrounds/${newCampground._id}`)
}))
// } catch(e){
//     // When we catch error, "next" calls the Error Handling middleware defined below, right before "app.listen"
//     next(e)
// }


// Read // Show all 
router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
}))
// Show one 
router.get("/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("reviews")
    if (!campground) {
        req.flash("error", "Can not find that campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { campground })
}))


// Update// Render form
router.get("/:id/edit", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash("error", "Can not find that campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { campground })
}))
// Edit 
router.put("/:id/", validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    // .campground because form names are "campground[title]...", i.e. we store form names in additional object
    const updatedCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash("success", "Successfully updated the campground")
    res.redirect(`/campgrounds/${updatedCampground._id}`)
}))


// Delete
router.delete("/:id/delete", catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    req.flash("success", "Campground was deleted")
    res.redirect("/campgrounds")
}))


module.exports = router