const Joi = require("joi")


// JOI data validation. Define a validation schema
// Shorter way of exporting without creating a variable. We just add property to module.exports.
module.exports.campgroundValidationSchema = Joi.object({
    // campground because form names are "campground[title]...", i.e. we store form names in additional object
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()      
})


module.exports.reviewValidationSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
})