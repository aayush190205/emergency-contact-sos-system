const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import our modular files
const { dbState } = require('./models/User');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- CONNECT TO MONGODB ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/sos_db';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(' MongoDB Connected');
        dbState.isMongoConnected = true; // Update the shared state
    })
    .catch(err => console.log(' MongoDB Offline (Using Memory Mode)'));

// --- ROUTES ---

// Health Check
app.get('/', (req, res) => {
    res.json({ 
        status: "System Online", 
        database: dbState.isMongoConnected ? "MongoDB" : "Memory (Mock)", 
        timestamp: new Date() 
    });
});

// Mount the API routes
app.use('/api', apiRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));