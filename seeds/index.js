// Import data from files in the same folder
const cities = require("./cities")
const { places, descriptors } = require("./seedHelpers")
// Requiring model
const Campground = require("../models/campground")


// Requiring and connecting Mongoose
const mongoose = require("mongoose")
main()
    .then(() => console.log("Mongoose connection Open"))
    .catch(err => console.log("Mongoose connection Error", err))
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp")
}


// Function to pick a random string from an array
const sample = (array) => array[Math.floor(Math.random() * array.length)]


// Reinitialize database
const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            image: "https://source.unsplash.com/collection/483251",
            description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt id enim, corporis accusantium dolore nesciunt a quos, animi commodi dolor aut cumque in voluptates ducimus? Voluptates dolore quaerat ipsam rem.",
            price
        })
        await camp.save()
    }
    console.log("Database reinitialized")
}


// Closing Mongoose connection
seedDB().then(() => {
    mongoose.connection.close()
    console.log("Mongoose connection Closed")
})