require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./utils/db");

const app = require("./app");

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

require("./events/sectionEvents").init(io);
require("./events/itemEvents").init(io);
app.set("io", io);

require("./socket/socket")(io);



server.listen(PORT, () => {
  console.log(`Server is running on ${BASE_URL}`);
});


module.exports = app;