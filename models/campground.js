// This is similar to "models.py" in Django


const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Review = require("./review")
const user = require("./user")


// ImageSchema.
const ImageSchema = new Schema({
  url: String,
  filename: String
})


// WE USE "virtual" because we DON'T NEED TO STORE this altered url in the db.
// Edit the image url by adding width to the image according to the cloudinary docs.
ImageSchema.virtual("thumbnail").get(function () {
  // "this" refers to a particular image.
  return this.url.replace("/upload", "/upload/w_200")
})


// Force include virtuals when converting to JSON.
const opts = { toJSON: { virtuals: true } }


// CG Schema.
const CampgroundSchema = new Schema({
  title: String,
  images: [ImageSchema],  // It used to be a "image: String," when we just used url address, now it's an Array of image schemas.
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ]
}, opts)  // Force include virtuals when converting to JSON.


// Virtual to add link to the Mapbox popups.
CampgroundSchema.virtual('properties.popupMarkup').get(function () {
  // "this" refers to a particular campground.
  return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    `
})


// DELETING ALL RELATED REVIEWS. REFER TO MONGOOSE DOCS TO KNOW WHAT TO PASS IN "" DOUBLE QUOTES, diferent function trigger diferent ".post" middleware
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  // WDB
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } })
  }
  // vnratc
  // if (doc.reviews.length) {
  //     for (let review of doc.reviews) {
  //         let res = await Review.findByIdAndDelete(review)
  //         console.log(res)
  //     }
  // }
})


// Compiling model using schema and exporting it for use in other files
module.exports = mongoose.model("Campground", CampgroundSchema)