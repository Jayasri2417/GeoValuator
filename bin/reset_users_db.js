const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geovaluator';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB...');
        try {
            const result = await User.deleteMany({});
            console.log(`✅ Successfully deleted ${result.deletedCount} users.`);
            console.log('User database is now empty.');
        } catch (err) {
            console.error('❌ Error clearing users:', err);
        } finally {
            mongoose.disconnect();
            console.log('Disconnected.');
        }
    })
    .catch(err => console.error('❌ Connection error:', err));
