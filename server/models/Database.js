const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    status: { type: String, default: 'active' },
    contacts: [{ 
        name: { type: String, required: true },
        phone: { type: String, required: true }
    }],
    createdAt: { type: Date, default: Date.now }
});

const LogSchema = new mongoose.Schema({
    triggerType: { type: String, required: true },
    userName: { type: String, default: 'Guest' },
    userEmail: { type: String, default: 'N/A' },
    location: {
        lat: { type: String },
        lng: { type: String }
    },
    timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const EmergencyLog = mongoose.model('EmergencyLog', LogSchema);

let MEMORY_USERS = [];
let MEMORY_LOGS = [];
const dbState = { isMongoConnected: false };

module.exports = { User, EmergencyLog, MEMORY_USERS, MEMORY_LOGS, dbState };