const Listing = require("../models/listing");
// mapbox sdk for geo coding(co-ordinates)
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geoCodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
     console.log(allListings);
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist! ");
    return res.redirect("/listings");
    }
    let originalImg = listing.image.url;
    originalImg = originalImg.replace("/upload", "/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing ,originalImg });
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist.");
    return res.redirect("/listings");
  }
  res.render("listings/singleList", { listing });
};

module.exports.createListing = async (req, res, next) => {

  let geoCodingResponse = await geoCodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
  }).send();


  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
 
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = geoCodingResponse.body.features[0].geometry;
  await newListing.save();
  req.flash("success", "New listing created !");
  res.redirect("/listings");
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
  let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing is updated.");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing is deleted");
  res.redirect("/listings");
};
