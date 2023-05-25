// Campground Model.
const Campground = require("../models/campground")

// Cloudinary.
const { cloudinary } = require("../cloudinary")

// Import Mapbox and its token from .env
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })


// This is like "views.py" in Django where all the logic is wrtitten.


// Index page with all CGs.
module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({}).populate("author")
  res.render("campgrounds/index", { campgrounds })
}


// Render form to create new campground.
module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new")
}


// Create new CG.
module.exports.createCampground = async (req, res, next) => {

  // Convert query to coordinates (Forward geocoding: name => coordinates).
  const geoData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send()

  // Get data from form inputs.
  const newCampground = new Campground(req.body.campground)

  // Add geoJSON to newCampground.
  newCampground.geometry = geoData.body.features[0].geometry

  // Add url and filename to the created campground.
  newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))

  // Add author and save changes.
  newCampground.author = req.user._id
  await newCampground.save()
  
  console.log(newCampground)
  req.flash("success", "Successfully created a new campground")
  res.redirect(`/campgrounds/${newCampground._id}`)
}


// Show one CG.
module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate("author")
    .populate({     // Populate review authors using "path" in an object
      path: "reviews",
      populate: {
        path: "author"
      }
    })

  // if (campground.geometry.coordinates.length) console.log(campground.geometry)

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


// Render Edit form.
module.exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
  if (!campground) {
    req.flash("error", "Can not find that campground")
    return res.redirect("/campgrounds")
  }
  res.render("campgrounds/edit", { campground })
}


// Update CG.
module.exports.updateCampground = async (req, res) => {

  // Get the campground id from the request.
  const { id } = req.params

  // Convert query to coordinates (Forward geocoding: location name => coordinates).
  const geoData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send()

  // Show error if Mapbox couldn't find valid location based on the form input.
  // console.log(geoData.body.features[0])
  if (!geoData.body.features[0]) {
    req.flash("error", "Invalid Location")
    return res.redirect(`/campgrounds/${id}`)
  }

  // ".campground" because form names are "campground[title]...", i.e. we store form names in additional object.
  const updatedCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })

  // Add geoJSON to newCampground.
  updatedCampground.geometry = geoData.body.features[0].geometry

  // Add newly uploaded images form "req.files" to the exsting "images" array.
  const uploadedImages = req.files.map(f => ({ url: f.path, filename: f.filename }))
  // Use ...spread to copy elements inside the uploadedImages array.
  updatedCampground.images.push(...uploadedImages)
  await updatedCampground.save()

  // Delete images if they were checked in the edit form.

  // Delete from Cloudinary.
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename)
    }

    // Delete from Mongo.
    await updatedCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })  // $pull is the Mongo operator(see docs https://www.mongodb.com/docs/manual/reference/operator/update/pull/).
    console.log(updatedCampground)
  }

  req.flash("success", "Campground was successfully updated")
  res.redirect(`/campgrounds/${updatedCampground._id}`)
}


// Delete CG.
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