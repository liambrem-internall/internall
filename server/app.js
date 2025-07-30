const express = require("express");
const cors = require("cors");
const checkJwt = require("./middleware/checkJwt");

const app = express();

app.use(express.json());
app.use(cors());

const userRoutes = require("./routes/userRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const itemRoutes = require("./routes/itemRoutes");
const searchRoutes = require("./routes/searchRoutes");
const browseRoutes = require("./routes/browseRoutes");

app.use("/api/users", checkJwt, userRoutes);
app.use("/api/sections", checkJwt, sectionRoutes);
app.use("/api/items", checkJwt, itemRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/browse", browseRoutes);

module.exports = app;