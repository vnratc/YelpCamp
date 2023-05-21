// This is similar to "models.py" in Django


const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Review = require("./review")
const user = require("./user")

const CampgroundSchema = new Schema({
    title: String,
    image: String,
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
})


// DELETING ALL RELATED REVIEWS. REFER TO MONGOOSE DOCS TO KNOW WHAT TO PASS IN "" DOUBLE QUOTES, diferent function trigger diferent ".post" middleware
CampgroundSchema.post("findOneAndDelete", async function (doc) {
    // WDB
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews }})
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