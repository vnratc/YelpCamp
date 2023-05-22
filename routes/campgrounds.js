// Express.
const express = require("express")

// { mergeParams: true } is for params be available in "app.js" file.
const router = express.Router({ mergeParams: true })

// Error wrapping function. // catchAsync takes function as argument, runs it with ".catch(next)" and returns it INSTEAD OF TRY / CATCH (see leftovers in controllers).
const catchAsync = require("../utils/catchAsync")

// Middleware to check and validate.
const { isLoggedIn, isCampAuthor, validateCampground } = require("../middleware.js")

// Controllers.
const campgrounds = require("../controllers/campgrounds")

// Multer - middleware to process uploaded files using "enctype="multipart/form-data"".
const multer = require('multer')

// Former place to store images locally
// const upload = multer({ dest: 'uploads/' })

// Import instance of CloudinaryStorage. It automatically is looking for index file, no need to type its name.
const { storage } = require("../cloudinary")
// New place to store images in cloudinary.
const upload = multer({ storage })


// This is similar "urls.py" in Django "path("login", views.login_view, name="login")"


router.route("/")
  .get(catchAsync(campgrounds.index)) // Read, Show all
  .post(  // Create new CG
    isLoggedIn,
    upload.array("image"),  // image is the input name in the form to create CG.
    validateCampground,
    catchAsync(campgrounds.createCampground))

// WDB54: practicing uploading files to the cloudinary.
// .post(upload.array("image"), (req, res) => {
//     console.log(req.body, req.files)
// })


// Create // Form // It HAS to be above all "/:id" routes to work
router.get("/new",
  isLoggedIn,
  campgrounds.renderNewForm) // We add Middleware to route handlers by adding it as an argument after the path.


router.route("/:id")
  .get(catchAsync(campgrounds.showCampground)) // Show one CG.
  .put(   // Update, Edit CG.
    isLoggedIn,
    isCampAuthor,
    upload.array("image"),  // Multer image upload middleware.
    validateCampground,
    catchAsync(campgrounds.updateCampground))
  .delete(    // Delete CG.
    isLoggedIn,
    isCampAuthor,
    catchAsync(campgrounds.deleteCampground))


// Render update form
router.get("/:id/edit",
  isLoggedIn,
  isCampAuthor,
  catchAsync(campgrounds.renderEditForm))


module.exports = router



