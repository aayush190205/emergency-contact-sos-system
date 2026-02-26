const mongoose = require('mongoose');

// --- SCHEMA ---
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// --- MOCK DATABASE STATE (For Docker Fallback) ---
const MEMORY_USERS = [];
const dbState = { isMongoConnected: false };

module.exports = { User, MEMORY_USERS, dbState };