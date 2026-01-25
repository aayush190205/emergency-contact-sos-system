const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- CONNECT TO MONGODB ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/sos_db';
let isMongoConnected = false;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('✅ MongoDB Connected');
        isMongoConnected = true;
    })
    .catch(err => console.log('⚠️ MongoDB Offline (Using Memory Mode)'));

// --- SCHEMA ---
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const MEMORY_USERS = [];

// --- ROUTES ---

// Health Check
app.get('/', (req, res) => {
    res.json({ 
        status: "System Online", 
        database: isMongoConnected ? "MongoDB" : "Memory (Mock)", 
        timestamp: new Date() 
    });
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    // --- SPECIAL ADMIN LOGIN ---
    if (email === "admin@sos.com" && password === "admin") {
        console.log(`🔐 ADMIN LOGGED IN: ${email}`); // <--- LOG FOR DOCKER
        return res.json({ success: true, role: 'admin', name: "Administrator" });
    }

    let user;
    if (isMongoConnected) {
        user = await User.findOne({ email, password });
    } else {
        user = MEMORY_USERS.find(u => u.email === email && u.password === password);
    }

    if (user) {
        console.log(`👤 USER LOGGED IN: ${user.name} (${user.email})`); // <--- LOG FOR DOCKER
        return res.json({ success: true, role: 'user', name: user.name });
    }
    
    console.log(`❌ FAILED LOGIN ATTEMPT: ${email}`);
    res.status(401).json({ success: false, message: "Invalid Credentials" });
});

// Signup
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;
    
    console.log(`📝 NEW SIGNUP REQUEST: ${name} (${email})`); // <--- LOG FOR DOCKER

    if (isMongoConnected) {
        if (await User.findOne({ email })) return res.json({ success: false, message: "User exists" });
        await new User({ name, email, password }).save();
    } else {
        if (MEMORY_USERS.find(u => u.email === email)) return res.json({ success: false, message: "User exists" });
        MEMORY_USERS.push({ name, email, password, role: 'user', createdAt: new Date() });
    }
    
    console.log(`✅ USER SAVED TO DATABASE: ${email}`); // <--- SUCCESS LOG
    res.json({ success: true, message: "Registration Successful" });
});

// Get All Users (For Admin Panel)
app.get('/api/users', async (req, res) => {
    if (isMongoConnected) {
        const users = await User.find({}, '-password');
        res.json(users);
    } else {
        res.json(MEMORY_USERS);
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));