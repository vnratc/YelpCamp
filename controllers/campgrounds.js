const campground = require("../models/campground")
const Campground = require("../models/campground")


// Index
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
}


// Form to create new campground
module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new")
}


module.exports.createCampground = async (req, res, next) => {
    const newCampground = new Campground(req.body.campground)
    newCampground.author = req.user._id
    await newCampground.save()
    req.flash("success", "Successfully created a new campground")
    res.redirect(`/campgrounds/${newCampground._id}`)
}


module.exports.showCampground = async (req, res) => {
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
    // Calculate average rating
    let total = 0
    for (let review of campground.reviews) {
        total = total + review.rating
    }
    const average = Math.round(total / campground.reviews.length)
    res.render("campgrounds/show", { campground, average })
}


module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash("error", "Can not find that campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { campground })
}


module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    // .campground because form names are "campground[title]...", i.e. we store form names in additional object
    const updatedCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash("success", "Campground was successfully updated")
    res.redirect(`/campgrounds/${updatedCampground._id}`)
}


module.exports.deleteCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    await Campground.findByIdAndDelete(req.params.id)
    req.flash("success", `${campground.title} campground was deleted`)
    res.redirect("/campgrounds")
}


// try{
// // .campground because form names are "campground[title]...", i.e. we store form names in additional object
// if(!req.body.campground) throw new ExpressError("Invalid Campground Data", 400)
// } catch(e){
//     // When we catch error, "next" calls the Error Handling middleware defined below, right before "app.listen"
//     next(e)
// }