const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Plugin that adds username, password hashing, authentication methods, etc.
const passportLocalMongoose = require("passport-local-mongoose").default;


// The plugin will automatically add username, hash, and salt fields.
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});


// Enhance the schema with authentication features like:
// User.register(), User.authenticate(),
// User.serializeUser(), User.deserializeUser(), etc.
userSchema.plugin(passportLocalMongoose);

// Create and export the User model.
module.exports = mongoose.model("User", userSchema);