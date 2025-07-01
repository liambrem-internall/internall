require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

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

app.use("/api/users", checkJwt, userRoutes);
app.use("/api/sections", checkJwt, sectionRoutes);
app.use("/api/items", checkJwt, itemRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

require("./socket/socket")(io);

server.listen(PORT, () => {
  console.log(`Server is running on ${BASE_URL}`);
});
