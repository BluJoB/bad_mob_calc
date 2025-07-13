require('dotenv').config(); // Load .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true, // Allow all origins - you can restrict this to your GoDaddy domain later
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static('.')); // Serve static files

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bad_mob_calc';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
}).then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`URI: ${MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@')}`); // Hide credentials in logs
}).catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Full error:', err);
    console.error('Connection string format: ', MONGODB_URI ? 'mongodb+srv://...' : 'NOT SET');
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

// Submit demo form data
app.post('/api/submitDemo', async (req, res) => {
    try {
        // Validate required fields
        const { firstName, lastName, email, termsAccepted, contactConsent } = req.body;
        
        if (!firstName || !lastName || !email) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: firstName, lastName, and email are required'
            });
        }

        if (!termsAccepted || !contactConsent) {
            return res.status(400).json({
                success: false,
                error: 'Both terms acceptance and contact consent must be agreed to'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // Save to demo_users collection
        const demoUser = new DemoUser({
            firstName: req.body.firstName.trim(),
            lastName: req.body.lastName.trim(),
            email: req.body.email.trim().toLowerCase(),
            company: req.body.company || null,
            phone: req.body.phone || null,
            products: req.body.products || [],
            termsAccepted: req.body.termsAccepted,
            contactConsent: req.body.contactConsent,
            timestamp: new Date(),
            source: req.body.source || 'demo_form',
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        await demoUser.save();

        console.log(`✅ New demo user registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Demo request submitted successfully',
            userId: demoUser._id
        });

    } catch (error) {
        console.error('Error in /api/submitDemo:', error);
        
        // Check for duplicate email
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(409).json({
                success: false,
                error: 'This email is already registered for demo access'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to submit demo request. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Submit secure demo form with agreement tracking
app.post('/api/submitDemoSecure', async (req, res) => {
    try {
        // Validate required fields
        const { firstName, lastName, email, products, agreementDetails } = req.body;
        
        if (!firstName || !lastName || !email || !products || products.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        if (!agreementDetails || !agreementDetails.timestamp) {
            return res.status(400).json({
                success: false,
                error: 'Agreement details are required'
            });
        }

        // Generate secure access tokens for each product
        const accessTokens = {};
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hour expiry

        products.forEach(product => {
            const token = crypto.randomBytes(32).toString('hex');
            accessTokens[product] = token;
        });

        // Save to demo_users collection with agreement details
        const demoUser = new DemoUser({
            firstName: req.body.firstName.trim(),
            lastName: req.body.lastName.trim(),
            email: req.body.email.trim().toLowerCase(),
            company: req.body.company || null,
            phone: req.body.phone || null,
            products: req.body.products || [],
            termsAccepted: true,
            contactConsent: req.body.contactConsent,
            agreementDetails: {
                ...req.body.agreementDetails,
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
                acceptedAt: new Date()
            },
            accessTokens: Object.keys(accessTokens).map(product => ({
                product,
                token: accessTokens[product],
                expiresAt: tokenExpiry,
                used: false,
                createdAt: new Date()
            })),
            source: req.body.source || 'demo_form_secure',
            timestamp: new Date()
        });

        await demoUser.save();

        console.log(`✅ Secure demo user registered: ${email} with agreement at ${agreementDetails.timestamp}`);

        res.status(201).json({
            success: true,
            message: 'Demo request submitted successfully with agreement recorded',
            userId: demoUser._id,
            accessTokens: accessTokens // Return tokens for immediate use
        });

    } catch (error) {
        console.error('Error in /api/submitDemoSecure:', error);
        
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(409).json({
                success: false,
                error: 'This email already has demo access. Please contact support if you need assistance.'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to submit demo request. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Validate and consume access token
app.get('/demo/access', async (req, res) => {
    try {
        const { token, product } = req.query;
        
        if (!token || !product) {
            return res.status(400).send('Invalid access link');
        }

        // Find user with this token
        const user = await DemoUser.findOne({
            'accessTokens.token': token,
            'accessTokens.product': product
        });

        if (!user) {
            return res.status(404).send('Invalid or expired access link');
        }

        // Find the specific token
        const tokenData = user.accessTokens.find(t => t.token === token && t.product === product);
        
        if (!tokenData) {
            return res.status(404).send('Access token not found');
        }

        // Check if already used
        if (tokenData.used) {
            return res.status(403).send('This access link has already been used');
        }

        // Check if expired
        if (new Date() > new Date(tokenData.expiresAt)) {
            return res.status(403).send('This access link has expired');
        }

        // Mark token as used
        await DemoUser.updateOne(
            { 
                _id: user._id,
                'accessTokens.token': token 
            },
            { 
                $set: { 
                    'accessTokens.$.used': true,
                    'accessTokens.$.usedAt': new Date()
                }
            }
        );

        // Redirect to actual demo based on product
        let redirectUrl;
        if (product === 'TIA Works') {
            redirectUrl = 'https://bad-mob-calc.onrender.com';
        } else if (product === 'TIA 1.OH') {
            redirectUrl = 'https://image-text-1.onrender.com';
        } else {
            return res.status(400).send('Unknown product');
        }

        // Log access
        console.log(`✅ Demo access granted for ${user.email} to ${product}`);

        // Redirect to demo
        res.redirect(redirectUrl);

    } catch (error) {
        console.error('Error validating access token:', error);
        res.status(500).send('Error processing access request');
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

// Health check endpoint with detailed info
app.get('/api/health', (req, res) => {
    const mongoStatus = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    
    res.json({
        success: true,
        status: 'healthy',
        mongodb: {
            status: mongoStatus[mongoose.connection.readyState] || 'unknown',
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host || 'not connected',
            name: mongoose.connection.name || 'not connected'
        },
        environment: {
            hasMongoUri: !!process.env.MONGODB_URI,
            nodeEnv: process.env.NODE_ENV || 'production'
        },
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
    console.log(`\n📊 Admin Panels:`);
    console.log(`   - Calculator Leads: http://localhost:${PORT}/admin.html`);
    console.log(`   - Demo Users: http://localhost:${PORT}/demo-admin.html`);
    console.log(`   - Demo Users Enhanced: http://localhost:${PORT}/demo-admin-enhanced.html`);
    console.log(`\n📝 Forms:`);
    console.log(`   - Demo Form (Simple): http://localhost:${PORT}/demo-form.html`);
    console.log(`   - Demo Form (Hover): http://localhost:${PORT}/demo-form-hover.html`);
    console.log(`   - Demo Form (Secure): http://localhost:${PORT}/demo-form-secure.html`);
    console.log(`   - Calculator: http://localhost:${PORT}/`);
    console.log(`\n🔍 API Endpoints:`);
    console.log(`   - POST /api/leads             (Calculator leads)`);
    console.log(`   - GET  /api/leads             (View calculator leads)`);
    console.log(`   - POST /api/submitDemo        (Demo form submissions)`);
    console.log(`   - POST /api/submitDemoSecure  (Secure demo with agreements)`);
    console.log(`   - GET  /api/getDemoUsers      (View demo users)`);
    console.log(`   - GET  /demo/access           (Token validation & redirect)`);
    console.log(`   - GET  /api/health            (Health check)`);
});

// Export for testing
module.exports = app;