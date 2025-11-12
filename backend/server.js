const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http'); // For Socket.io
const { Server } = require("socket.io"); // For Socket.io

// Import routes
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');

const app = express();
const PORT = 5000; 

// --- Create HTTP Server & Wrap Express ---
const server = http.createServer(app); 
const io = new Server(server, { 
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// --- MONGODB CONNECTION ---
mongoose.connect('mongodb://localhost:27017/evercareDB')
  .then(() => console.log('Connected to MongoDB')) 
  .catch(err => console.error('Could not connect to MongoDB', err));

// --- Middleware ---
app.use(cors()); 
app.use(express.json());

// --- Give Routes Access to Socket.IO ---
app.set('io', io);

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// --- Serve Frontend Static Files ---
app.use(express.static(path.join(__dirname, '..'))); 

// --- SOCKET.IO CONNECTION LOGIC ---
io.on('connection', (socket) => {
    console.log('A user connected via WebSocket');
    socket.on('join_volunteer_room', (volunteerName) => {
        socket.join(volunteerName);
        console.log(`Volunteer ${volunteerName} joined their notification room.`);
    });
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// --- Server Startup ---
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});