require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const Listing = require("../models/listing");
let { data } = require("./data");

async function main() {
  await mongoose.connect(process.env.DB_URL);
  console.log("Connected to Atlas");
}

main()
  .then(seedDB)
  .catch(console.log);

async function seedDB() {
  await Listing.deleteMany({});

  data = data.map((obj) => ({
    ...obj,
    owner: "6a4385d2a6e4c49a39767ef5",
  }));

  await Listing.insertMany(data);

  console.log("Data inserted successfully");

  mongoose.connection.close();
}