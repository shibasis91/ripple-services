const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const db_url = process.env.DB_URL;
const connectDB = async () => {
  try {
    await mongoose.connect(db_url, { autoIndex: false });
    console.log("Connected to database");
  } catch (error) {
    console.log("Error connecting to database servers", error);
  }
};

module.exports = connectDB;
