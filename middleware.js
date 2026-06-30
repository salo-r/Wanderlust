const Listing = require("./models/listing");
const Review = require("./models/review.js")
const ExpressError = require("./utils/expressError");
const { listingSchema } = require("./schema.js");
const { reviewSchema } = require("./schema.js");

// middleware to check if user is loggedin
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create listing!");
    return res.redirect("/login");
    }
    next();
}


module.exports.saveRedirectUrl = (req, res,next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req, res, next) => {
  const { id } = req.params;
  let listing = await Listing.findById(id);
  console.log(`listing is ${listing}`);
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
      req.flash("error", "You don't have permission to edit.");
      return res.redirect(`/listings/${id}`)
    } next();
}


module.exports.isReviewAuthor = async(req, res, next) => {
  const { id,reviewId } = req.params;
  let review = await Review.findById(reviewId);
  console.log("res.locals.currUser is......", res.locals.currUser);
    if (!review) {
    req.flash("error", "Review not found.");
    return res.redirect(`/listings/${id}`);
  }
    if (!review.author.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not the author of this listing.");
      return res.redirect(`/listings/${id}`)
    } return next();
}

    // middleware
module.exports.validateListing = (req, res, next) => {
  console.log(req.body);
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// middleware
module.exports.validateReview = (req, res, next) => {
    console.log(req.body);
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  else{
    next();
  }
}
