const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./src/config/db');
const classRoutes = require('./src/routes/classRoutes');
const socketHandler = require('./src/sockets/socketHandler');
const authRoutes = require("./src/routes/authRoutes");

const app = express();
const server = http.createServer(app);

// 🔥 CORS (IMPORTANT)
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// 🔥 ROUTES
app.use('/api/class', classRoutes);
app.use("/api/auth", authRoutes);

// 🔥 SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

socketHandler(io);

// 🔥 DB CONNECT
connectDB();

app.get('/', (req, res) => {
  res.send("Server running 🚀");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));