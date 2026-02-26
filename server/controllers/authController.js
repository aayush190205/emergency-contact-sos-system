const { User, MEMORY_USERS, dbState } = require('../models/User');

// Login Logic
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    // --- SPECIAL ADMIN LOGIN ---
    if (email === "admin@sos.com" && password === "admin") {
        console.log(`🔐 ADMIN LOGGED IN: ${email}`); // <--- LOG FOR DOCKER
        return res.json({ success: true, role: 'admin', name: "Administrator" });
    }

    let user;
    if (dbState.isMongoConnected) {
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
};

// Signup Logic
exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
    
    console.log(`📝 NEW SIGNUP REQUEST: ${name} (${email})`); // <--- LOG FOR DOCKER

    if (dbState.isMongoConnected) {
        if (await User.findOne({ email })) return res.json({ success: false, message: "User exists" });
        await new User({ name, email, password }).save();
    } else {
        if (MEMORY_USERS.find(u => u.email === email)) return res.json({ success: false, message: "User exists" });
        MEMORY_USERS.push({ name, email, password, role: 'user', createdAt: new Date() });
    }
    
    console.log(`✅ USER SAVED TO DATABASE: ${email}`); // <--- SUCCESS LOG
    res.json({ success: true, message: "Registration Successful" });
};

// Get All Users (For Admin Panel)
exports.getUsers = async (req, res) => {
    if (dbState.isMongoConnected) {
        const users = await User.find({}, '-password');
        res.json(users);
    } else {
        res.json(MEMORY_USERS);
    }
};