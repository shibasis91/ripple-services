const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoute");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
connectDB();

const port = process.env.PORT;

app.get("/", (req, res) => res.send("Welcome to ripple services!"));
app.get("/api/healthcheck", (req, res) =>
  res.status(200).send("Services are up")
);
app.use("/api/v1/user/", userRoutes);

app.listen(port, () => console.log(`App listening on port ${port}!`));
