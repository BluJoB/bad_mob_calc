require('dotenv').config(); // Load .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static('.')); // Serve static files

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bad_mob_calc';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log(`Database: bad_mob_calc`);
    console.log(`URI: ${MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@')}`); // Hide credentials in logs
}).catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Please check your MONGODB_URI environment variable');
    // Don't exit - allow server to run for static files
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

// Demo users schema
const demoUserSchema = new mongoose.Schema({}, { 
    collection: 'demo_users',
    strict: false  // Allow any fields since we don't know the exact schema
});

const DemoUser = mongoose.model('DemoUser', demoUserSchema);

// Get all demo users - Original route
app.get('/api/demo-users', async (req, res) => {
    try {
        const demoUsers = await DemoUser.find().sort({ _id: -1 });
        res.json({
            success: true,
            count: demoUsers.length,
            data: demoUsers
        });
    } catch (error) {
        console.error('Error fetching demo users:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get demo users - Alternative route name
app.get('/api/getDemoUsers', async (req, res) => {
    try {
        // Ensure we're connected to MongoDB
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection not established');
        }

        const demoUsers = await DemoUser.find().sort({ _id: -1 });
        
        res.json({
            success: true,
            count: demoUsers.length,
            data: demoUsers,
            database: 'bad_mob_calc',
            collection: 'demo_users'
        });
    } catch (error) {
        console.error('Error in /api/getDemoUsers:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get demo users with pagination
app.get('/api/demo-users/paginated', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [demoUsers, totalCount] = await Promise.all([
            DemoUser.find().skip(skip).limit(limit).sort({ _id: -1 }),
            DemoUser.countDocuments()
        ]);

        res.json({
            success: true,
            data: demoUsers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount: totalCount,
                hasNext: page < Math.ceil(totalCount / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching paginated demo users:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Serve the calculator
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Admin panel: http://localhost:${PORT}/admin.html`);
    console.log(`🔍 API endpoints:`);
    console.log(`   - POST /api/leads`);
    console.log(`   - GET  /api/leads`);
    console.log(`   - GET  /api/getDemoUsers`);
    console.log(`   - GET  /api/demo-users`);
    console.log(`   - GET  /api/health`);
});

// Export for testing
module.exports = app;