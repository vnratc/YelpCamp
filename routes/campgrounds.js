const express = require("express")
const router = express.Router({ mergeParams: true }) // { mergeParams: true } is for params be available in "app.js" file
const catchAsync = require("../utils/catchAsync") // Error wrapping function. // catchAsync takes function as argument, runs it with ".catch(next)" and returns it INSTEAD OF TRY / CATCH (see leftovers in controllers)
const { isLoggedIn, isCampAuthor, validateCampground } = require("../middleware.js")
const campgrounds = require("../controllers/campgrounds")


// This is similar to Django urls.py "path("login", views.login_view, name="login")"


router.route("/")
    // .post(  // Create new CG
    // isLoggedIn,
    // validateCampground,
    // catchAsync(campgrounds.createCampground))
    // .get(catchAsync(campgrounds.index)) // Read, Show all
    .post((req, res) => {
        res.send(req.body)
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



