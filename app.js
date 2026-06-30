if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// =========================
// Imports
// =========================

// Libraries
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Models
const User = require("./models/user");

// Routes
const listingRouter = require("./routes/listings");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

// Utilities
const ExpressError = require("./utils/expressError");

const app = express();
const PORT = process.env.PORT || 3000;

// =========================
// Configuration
// =========================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// =========================
// Database Connection
// =========================
const db_url = process.env.DB_URL;
console.log(db_url);
console.log(MongoStore);
main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(db_url);
  console.log("Database:", mongoose.connection.db.databaseName);
  const collections = await mongoose.connection.db.listCollections().toArray();

  console.log(collections);

  const count = await mongoose.connection.db
    .collection("listings")
    .countDocuments();

  console.log("Native Count:", count);
}

// =========================
// Built-in & Third-party Middleware
// =========================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// =========================
// Session Configuration
// =========================

const store = MongoStore.create({
  mongoUrl: db_url,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("Error in Mongo Session Store", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// =========================
// Passport Configuration
// =========================

app.use(passport.initialize());
app.use(passport.session()); // enable passport to use express session

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =========================
// Custom Middleware
// =========================

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.use((req, res, next) => {
  console.log(req.session);
  next();
});

// =========================
// Routes
// =========================

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// =========================
// 404 Handler
// =========================

app.all("/*splat", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// =========================
// Error Handling Middleware
// =========================

app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong" } = err;

  console.log(err);

  res.status(status).render("error.ejs", {
    message,
  });
});

// =========================
// Start Server
// =========================

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
