const BaseJoi = require("joi")
const sanitizeHtml = require('sanitize-html')

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    'string.escapeHTML': '{{#label}} must not include HTML!'
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value) return helpers.error('string.escapeHTML', { value })
        return clean
      }
    }
  }
})


const Joi = BaseJoi.extend(extension)


// JOI data validation. Define a validation schema
// Shorter way of exporting without creating a variable. We just add property to module.exports.
module.exports.campgroundValidationSchema = Joi.object({
  // campground because form names are "campground[title]...", i.e. we store form names in additional object
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required()
  }).required(),
  deleteImages: Joi.array()
})


module.exports.reviewValidationSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().escapeHTML()
  }).required()
})