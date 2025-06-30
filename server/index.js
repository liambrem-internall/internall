require("dotenv").config();
const express = require("express");
const cors = require("cors");

const checkJwt = require("./middleware/checkJwt");

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

const connectDB = require("./utils/db");
connectDB();

const userRoutes = require("./routes/userRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const itemRoutes = require("./routes/itemRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/items", itemRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on ${BASE_URL}`);
});

app.get("/api/protected", checkJwt, (req, res) => {
  res.json({ message: "Access granted. Secure data." });
});
