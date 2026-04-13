const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to DB to fetch OTP directly (since we can't see the SMS)
require('dotenv').config();

const BASE_URL = 'http://localhost:5050/api/auth';
const TEST_USER = {
    name: "OTP Test User",
    email: `otptest_${Date.now()}@example.com`,
    phone: `99999${Math.floor(Math.random() * 100000)}`, // Random phone
    password: "password123",
    preferred_location: "Test City",
    puzzleId: "mock-id", // MOCK logic needed if puzzle enabled
    puzzleAnswer: "MOCK"
};

// We need to bypass Puzzle check or use a valid one. 
// For testing, let's assume we can hit the endpoint. 
// If Puzzle is strict, we might fail unless we mock getPuzzle first.

async function testOTPFlow() {
    console.log("--- Starting OTP Flow Verification ---");

    try {
        // 1. Get Puzzle (to be valid)
        console.log("1. Fetching Puzzle...");
        const puzzleRes = await axios.get(`${BASE_URL}/get-puzzle`);
        const { puzzleId, debug_answer } = puzzleRes.data;
        console.log(`   Puzzle ID: ${puzzleId}, Answer: ${debug_answer}`);

        // 2. Register
        console.log("\n2. Registering User...");
        const regRes = await axios.post(`${BASE_URL}/register`, {
            ...TEST_USER,
            puzzleId,
            puzzleAnswer: debug_answer
        });

        console.log("   Registration Response:", regRes.status, regRes.data.message);
        const userId = regRes.data.userId;

        if (!userId) throw new Error("User ID not returned from registration");

        // 3. Fetch OTP from DB (Simulating User checking SMS)
        console.log("\n3. Fetching OTP from Database (Simulation)...");

        // Connect DB
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }

        // Wait a bit for DB save
        await new Promise(r => setTimeout(r, 1000));

        // Find user but we need the plain OTP? 
        // Wait, we stored the HASHED OTP. We cannot retrieve the plain OTP from DB.
        // ERROR: We cannot test this automatically unless we capture the console log or mock the SMS service.
        // BUT: In authController we are sending it via SMS.
        // HACK: For this test script, we can't easily get the OTP unless we brute force (bad) or mock.

        // Alternative: The valid flow is manual.
        console.log("   ⚠️ Cannot fetch plain OTP from DB (it is hashed).");
        console.log("   ⚠️ PLEASE CHECK SERVER LOGS FOR THE OTP IF 'generic' PROVIDER IS USED.");
        console.log(`   ⚠️ Look for: "Attempting to send to ... Content: ... Code: XXXXXX"`);

        // We will pause here and ask user to input? No, automated script.
        // Let's just Verify that the user exists and is unverified.

        const user = await User.findById(userId);
        console.log(`   User Verified Status: ${user.is_verified}`);
        console.log(`   User OTP Hash Exists: ${!!user.otp_code}`);

        if (user.is_verified === false && user.otp_code) {
            console.log("\n✅ Registration Created Unverified User with OTP.");
            console.log("   To complete verification fully, manual interaction or SMS service mock is required.");
        } else {
            console.error("\n❌ User creation state incorrect.");
        }

        // Cleanup
        await User.findByIdAndDelete(userId);
        console.log("\n4. Cleanup: Test user deleted.");

    } catch (error) {
        console.error("\n❌ Test Failed:", error.message);
        if (error.response) console.error("   Response:", error.response.data);
    } finally {
        if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
}

testOTPFlow();
