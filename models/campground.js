const mongoose = require("mongoose")
const Schema = mongoose.Schema


const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String
})


// Compiling model using schema and exporting it for use in other files
module.exports = mongoose.model("Campground", CampgroundSchema)