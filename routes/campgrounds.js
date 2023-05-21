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
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })


// This is similar "urls.py" in Django "path("login", views.login_view, name="login")"


router.route("/")
    .get(catchAsync(campgrounds.index)) // Read, Show all
    .post(upload.array("image"), (req, res) => {
        console.log("trying to create a new campground", req.body, req.files)
        // res.send("it worked")
    // .post(  // Create new CG
    // isLoggedIn,
    // validateCampground,
    // catchAsync(campgrounds.createCampground))
    })


// Create // Form // It HAS to be above all "/:id" routes to work
router.get("/new",
    isLoggedIn,
    campgrounds.renderNewForm) // We add Middleware to route handlers by adding it as an argument after the path.


router.route("/:id")
    .get(catchAsync(campgrounds.showCampground)) // Show one CG
    .put(   // Update, Edit
    isLoggedIn,
    isCampAuthor,
    validateCampground,
    catchAsync(campgrounds.updateCampground))
    .delete(    // Delete
    isLoggedIn,
    isCampAuthor,
    catchAsync(campgrounds.deleteCampground))


// Update// Render form
router.get("/:id/edit",
    isLoggedIn,
    isCampAuthor,
    catchAsync(campgrounds.renderEditForm))


module.exports = router



