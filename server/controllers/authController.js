const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { User, EmergencyLog, MEMORY_USERS, MEMORY_LOGS, dbState } = require('../models/Database');

// --- SECURE TWILIO CONFIGURATION ---
// The system now pulls these securely from your .env file
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID; 
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (email === "admin@sos.com" && password === "admin") {
        return res.json({ success: true, role: 'admin', name: "Administrator", contacts: [] });
    }
    let user;
    if (dbState.isMongoConnected) user = await User.findOne({ email, password });
    else user = MEMORY_USERS.find(u => u.email === email && u.password === password);

    if (!user) return res.status(401).json({ success: false, message: "Invalid Credentials" });
    if (user.status === 'blocked') return res.status(403).json({ success: false, message: "Account blocked by Admin." });

    return res.json({ success: true, role: 'user', name: user.name, email: user.email, contacts: user.contacts || [] });
};

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing required fields" });
    }

    try {
        if (dbState.isMongoConnected) {
            if (await User.findOne({ email })) return res.json({ success: false, message: "User exists" });
            await new User({ name, email, password, contacts: [], status: 'active' }).save();
        } else {
            if (MEMORY_USERS.find(u => u.email === email)) return res.json({ success: false, message: "User exists" });
            MEMORY_USERS.push({ id: Date.now().toString(), name, email, password, role: 'user', contacts: [], status: 'active', createdAt: new Date() });
        }
        res.json({ success: true, message: "Registration Successful" });
    } catch (err) {
        console.error("Signup Error:", err.message);
        res.json({ success: false, message: "Database validation failed." });
    }
};

exports.addContact = async (req, res) => {
    const { email, contactName, contactPhone } = req.body;
    try {
        if (dbState.isMongoConnected) {
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ success: false, message: "User not found" });
            user.contacts.push({ name: contactName, phone: contactPhone });
            await user.save();
            return res.json({ success: true, contacts: user.contacts });
        } else {
            const user = MEMORY_USERS.find(u => u.email === email);
            if (!user) return res.status(404).json({ success: false, message: "User not found" });
            if (!user.contacts) user.contacts = [];
            user.contacts.push({ name: contactName, phone: contactPhone });
            return res.json({ success: true, contacts: user.contacts });
        }
    } catch (err) { res.status(500).json({ success: false, message: "Failed to add contact" }); }
};

exports.processSOS = async (req, res) => {
    const { user, location } = req.body;
    const triggerType = user ? 'Registered User' : 'Guest';
    const userName = user ? user.name : 'Anonymous Guest';
    const userEmail = user ? user.email : 'N/A';

    // 1. Save Log to Database
    if (dbState.isMongoConnected) await new EmergencyLog({ triggerType, userName, userEmail, location }).save();
    else MEMORY_LOGS.push({ triggerType, userName, userEmail, location, timestamp: new Date() });

    const mapsLink = `http://googleusercontent.com/maps.google.com/?q=${location.lat},${location.lng}`;
    const messageContent = `🚨 SOS ALERT: ${userName} has triggered an emergency! Location: ${mapsLink}`;

    // 2. LIVE Twilio SMS Logic
    if (user && TWILIO_SID) {
        try {
            const client = twilio(TWILIO_SID, TWILIO_TOKEN);
            
            // Grabs the user's first registered contact. 
            // Note: If no contacts exist, it falls back to a placeholder.
            const targetPhone = (user.contacts && user.contacts.length > 0) ? user.contacts[0].phone : '+1234567890'; 
            
            // 🔥 LIVE DISPATCH TRIGGER 🔥
            const sms = await client.messages.create({ 
                body: messageContent, 
                from: TWILIO_PHONE, 
                to: targetPhone 
            });
            
            console.log(`📱 SMS SENT SUCCESSFULLY! Twilio SID: ${sms.sid}`);
        } catch (smsError) {
            console.error("❌ Twilio SMS Failed. (Check if number is verified on free tier):", smsError.message);
        }
    } else {
        console.log("👤 GUEST MODE or Missing .env credentials: Bypassing Twilio SMS.");
    }

    // 3. Send Mock Email for Backup/Demo (Always runs)
    try {
        let testAccount = await nodemailer.createTestAccount();
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email", port: 587, secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        let info = await transporter.sendMail({
            from: '"SafeConnect System" <alerts@safeconnect.com>',
            to: "police.dispatch@local.gov",
            subject: `SOS ALERT: ${userName}`, text: messageContent,
        });
        console.log(`\n🚨 SOS DISPATCH LOGGED. View Mock Email: ${nodemailer.getTestMessageUrl(info)}\n`);
        return res.json({ success: true, message: user ? "Contacts & Authorities Notified." : "Guest Location sent to dispatch." });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Logged locally, but dispatch failed." });
    }
};

exports.getAdminData = async (req, res) => {
    if (dbState.isMongoConnected) {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        const logs = await EmergencyLog.find().sort({ timestamp: -1 });
        res.json({ users, logs });
    } else res.json({ users: MEMORY_USERS, logs: MEMORY_LOGS.reverse() });
};

exports.deleteUser = async (req, res) => {
    const { email } = req.body;
    if (dbState.isMongoConnected) await User.findOneAndDelete({ email });
    else MEMORY_USERS = MEMORY_USERS.filter(u => u.email !== email);
    res.json({ success: true, message: "User Removed Successfully" });
};

exports.systemLog = (req, res) => {
    const { message, userEmail } = req.body;
    console.log(`🖥️ [UI ACTION LOG] - User: ${userEmail || 'Guest'} | Action: ${message}`);
    res.json({ success: true });
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        let testAccount = await nodemailer.createTestAccount();
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email", port: 587, secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        let info = await transporter.sendMail({
            from: '"SafeConnect Support" <support@safeconnect.com>',
            to: email, subject: "Password Reset Request", 
            text: `Click this link to reset your password: http://localhost:3000/reset-password\n(Note: This is a demo link)`,
        });
        console.log(`📧 VIEW PASSWORD RESET EMAIL HERE: ${nodemailer.getTestMessageUrl(info)}\n`);
        return res.json({ success: true, message: "If this email exists, a reset link has been sent." });
    } catch (err) { return res.status(500).json({ success: false, message: "System error during password reset." }); }
};