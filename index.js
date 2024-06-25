const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const authenticateToken = require("./middleware/authMiddleware");
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

app.use("/api/v1/auth/", authRoutes);
app.use("/api/v1/user/", authenticateToken, userRoute);

app.listen(port, () => console.log(`App listening on port ${port}!`));
