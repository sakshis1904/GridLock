require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Matchmaker = require('./matchmaker');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for now, lock down later
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
// For local dev, we can use a local URI if .env is missing, or default to a mock if needed.
// Ideally, the user should provide a MONGO_URI.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gridlock';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const Player = require('./models/Player');

app.get('/api/leaderboard', async (req, res) => {
    try {
        const topPlayers = await Player.find().sort({ wins: -1 }).limit(10);
        res.json(topPlayers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Matchmaker instance
const matchmaker = new Matchmaker(io);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_queue', (data) => {
        // data should contain username
        const username = data?.username || `Guest_${socket.id.substr(0, 4)}`;
        matchmaker.addPlayer(socket, username);
    });

    socket.on('make_move', (data) => {
        matchmaker.handleMove(socket, data.column);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        matchmaker.removePlayer(socket);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
