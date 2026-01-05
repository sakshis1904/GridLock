const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    p1: { type: String, required: true },
    p2: { type: String, required: true },
    winner: { type: String }, // null if draw
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', matchSchema);
