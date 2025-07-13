const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bad_mob_calc';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Lead schema
const leadSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    companySize: {
        type: String,
        required: true
    },
    painPoint: {
        type: String,
        required: true
    },
    newsletter: {
        type: Boolean,
        default: false
    },
    source: {
        type: String,
        default: 'bad_mob_calc'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    calculatorData: {
        incidentCost: Number,
        annualCost: Number,
        revenuePercentage: Number
    }
});

const Lead = mongoose.model('Lead', leadSchema);

// API Routes
app.post('/api/leads', async (req, res) => {
    try {
        const lead = new Lead(req.body);
        await lead.save();
        res.status(201).json({ success: true, message: 'Lead saved successfully' });
    } catch (error) {
        console.error('Error saving lead:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get leads (protected - add authentication in production)
app.get('/api/leads', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ timestamp: -1 });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve the calculator
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});