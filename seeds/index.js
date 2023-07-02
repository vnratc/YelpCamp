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
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000)
    const price = Math.floor(Math.random() * 20) + 10


    // Generate random coordinates.
    const randomLng = () => {
      let lng =Math.floor(Math.random() * 180)
      // 50 / 50 chance of negative number
      return lng *= Math.round(Math.random()) ? 1 : -1
    }
    const randomLat = () => {
      let lat = Math.floor(Math.random() * 90)
      return lat *= Math.round(Math.random()) ? 1 : -1
    }
    // console.log(randomLng(), randomLat())


    const camp = new Campground({
      // user: vlad
      author: "6446561ad3ae3dd4b72dca80",
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      image: "https://source.unsplash.com/collection/483251",
      description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt id enim, corporis accusantium dolore nesciunt a quos, animi commodi dolor aut cumque in voluptates ducimus? Voluptates dolore quaerat ipsam rem.",
      price,
      geometry: {
        type: 'Point',
        // coordinates: [randomLng(), randomLat()]
        coordinates: [
          cities[random1000].longitude,  // Get coordinates from the city.
          cities[random1000].latitude
        ]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/drzyxwo23/image/upload/v1684779426/YelpCamp/beach-boat_gjkp8o.jpg',
          filename: 'YelpCamp/beach-boat_gjkp8o.jpg'
        },
        {
          url: 'https://res.cloudinary.com/drzyxwo23/image/upload/v1684779422/YelpCamp/nature-mountains_n3ijmr.jpg',
          filename: 'YelpCamp/nature-mountains_n3ijmr.jpg'
        }
      ]
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