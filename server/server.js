const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');


const { dbState } = require('./models/Database');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sos_db';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log(`✅ MongoDB Connected successfully!`);
    dbState.isMongoConnected = true; 
})
.catch(err => {
    console.error('❌ MongoDB Connection Error. Using Memory fallback.', err.message);
    dbState.isMongoConnected = false;
});

// All routes (including /api/sos, /api/login, /api/contacts, etc.) are handled here
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend Server running on port ${PORT}`));