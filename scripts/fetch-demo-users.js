// Standalone script to fetch demo users from MongoDB
// Usage: node scripts/fetch-demo-users.js

require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bad_mob_calc';

// Demo user schema - flexible to accept any structure
const demoUserSchema = new mongoose.Schema({}, { 
    collection: 'demo_users',
    strict: false
});

const DemoUser = mongoose.model('DemoUser', demoUserSchema);

async function fetchDemoUsers() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected successfully!');

        // Fetch all demo users
        console.log('\nFetching demo users...');
        const demoUsers = await DemoUser.find();
        
        console.log(`\nFound ${demoUsers.length} demo users:\n`);
        
        // Display each user
        demoUsers.forEach((user, index) => {
            console.log(`--- User ${index + 1} ---`);
            console.log(JSON.stringify(user.toObject(), null, 2));
            console.log('');
        });

        // Summary statistics
        if (demoUsers.length > 0) {
            console.log('\n--- Summary ---');
            console.log(`Total users: ${demoUsers.length}`);
            
            // Try to extract common fields if they exist
            const emails = demoUsers.filter(u => u.email).map(u => u.email);
            if (emails.length > 0) {
                console.log(`Users with emails: ${emails.length}`);
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('\nConnection closed.');
    }
}

// Run the script
fetchDemoUsers();