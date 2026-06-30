const express = require("express");
const router = express.Router({mergeParams :true});
const ExpressError = require("../utils/expressError");
const wrapAsync = require("../utils/wrapAsync");

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/review.js");
// reviews
router.post(
  "/",isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview),
);

// delete review
router.delete(
  "/:reviewId",isLoggedIn,isReviewAuthor,
  wrapAsync(reviewController.destroyReview),
);
module.exports = router;