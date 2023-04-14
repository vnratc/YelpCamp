// Imports


// Initializing Express
const express = require("express")
const app = express()
// Requiring model
const Campground = require("./models/campground")
// Add different request types
const methodOverride = require("method-override")



// Requiring and connecting Mongoose
const mongoose = require("mongoose")
main()
    .then(() => console.log("Mongoose connection Open"))
    .catch(err => console.log("Mongoose connection Error", err))
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp")
}


// Setting a derictory for the application's views and a default engine to use
const path = require("path")
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")


// Import ability to extracting form data (parse req.body)
app.use(express.urlencoded({ extended: true }))
// Add different request types
app.use(methodOverride("_method"))


// View routes


// Home page
app.get("/", (req, res) => {
    res.render("home")
})


// New. It HAS to be above all "/:id" routes to work
// Render form
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new")
})
// Create
app.post("/campgrounds", async (req, res) => {
    // .campground because form names are "campground[title]...", i.e. we store form names in additional object
    const newCampground = new Campground(req.body.campground)
    await newCampground.save()
    res.redirect(`/campgrounds/${newCampground._id}`)
})


// Show all 
app.get("/campgrounds", async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
})
// Show one 
app.get("/campgrounds/:id", async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/show", { campground })
})


// Edit
// Render form
app.get("/campgrounds/:id/edit", async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/edit", { campground })
})
// Update
app.put("/campgrounds/:id/", async (req, res) => {
    const { id } = req.params
    // .campground because form names are "campground[title]...", i.e. we store form names in additional object
    const updatedCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${updatedCampground._id}`)
})


// Delete
app.delete("/campgrounds/:id/delete", async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    res.redirect("/campgrounds")
})


// Starting server
app.listen(3000, () => {
    console.log("Listening on port 3000")
})