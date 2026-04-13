const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const requestIp = require('request-ip');
const useragent = require('useragent');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../utils/emailService');

// ============ CONFIGURATION ============
console.log('[Auth] Controller Loading...');

// Helper: Send Email with resilient fallback
// DELETED: Using central emailService instead.

// ============ REGISTER ============
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, preferred_location } = req.body;
        console.log(`[Register] Attempt: ${email} | Location: ${preferred_location}`);

        if (!email || !password || !name) {
            return res.status(400).json({ error: "Name, Email, and Password are required" });
        }

        // 1. Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this email or phone" });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

        // 4. Create User (Unverified)
        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            preferred_location,
            last_login: new Date(),
            lastIp: requestIp.getClientIp(req),
            is_verified: false, // verification required
            otp_code: await bcrypt.hash(otp, 10), // Store hashed OTP
            otp_expires_at: otpExpiresAt
        });

        await newUser.save();

        // 5. Send OTP Email
        console.log(`[OTP] Generated for ${email}: ${otp}`); // Always log for dev convenience

        await sendEmail(email, 'Your Verification Code', `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2>Verify Your Account</h2>
                <p>Hello ${name},</p>
                <p>Your verification code for GeoValuator is:</p>
                <h1 style="color: #0F3460; letter-spacing: 5px;">${otp}</h1>
                <p>This code expires in 10 minutes.</p>
            </div>
        `);

        // 6. Return response indicating verification needed
        res.status(201).json({
            success: true,
            message: "Registration successful. Please check your email for the verification code.",
            requiresVerification: true,
            userId: newUser._id,
            email: newUser.email
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Registration failed", details: error.message });
    }
};

// ============ VERIFY OTP ============
exports.verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) {
            return res.status(400).json({ error: "User ID and OTP are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        if (user.is_verified) {
            // If already verified, just login
            // Generate Token
            const token = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET || 'your_secret_key',
                { expiresIn: '7d' }
            );
            return res.status(200).json({
                success: true,
                message: "User already verified",
                token,
                user: { id: user._id, name: user.name, email: user.email, role: 'citizen' }
            });
        }

        if (!user.otp_code || !user.otp_expires_at || user.otp_expires_at < Date.now()) {
            return res.status(400).json({ error: "OTP expired. Please register again or request new code." });
        }

        const isMatch = await bcrypt.compare(otp, user.otp_code);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        // Valid OTP!
        user.is_verified = true;
        user.otp_code = undefined;
        user.otp_expires_at = undefined;
        user.last_login = new Date();
        await user.save();

        // Generate Token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: "Verification successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                preferred_location: user.preferred_location
            }
        });

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ error: "Verification failed", details: error.message });
    }
};

// ============ LOGIN ============
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // 1. Find User
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // 2. Check Password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // 3. Update Stats
        const clientIp = requestIp.getClientIp(req);
        user.lastIp = clientIp;
        user.last_login = new Date();
        await user.save();

        // 4. Send Login Alert (Async, don't await)
        const htmlAlert = `
            <div style="font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e1e4e8; border-radius: 8px; background-color: #ffffff; padding: 0;">
                <div style="padding: 40px 50px;">
                    <h1 style="color: #24292e; font-size: 28px; font-weight: 700; margin: 0; padding-bottom: 15px; text-align: left;">New Login Detected</h1>
                    <div style="height: 2px; width: 100%; background-color: #3182ce; margin-bottom: 30px;"></div>
                    
                    <p style="color: #444; font-size: 16px; margin: 0 0 15px 0;">Hello ${user.name || 'User'},</p>
                    <p style="color: #444; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                        We detected a new login to your <span style="background-color: #f6e05e; padding: 1px 4px; border-radius: 2px; font-weight: 600;">GeoValuator</span> account.
                    </p>

                    <div style="background-color: #f7f9fa; border-radius: 4px; margin-bottom: 30px; overflow: hidden;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <tr style="background-color: #f7f9fa;">
                                <td style="padding: 16px 20px; color: #1a202c; font-size: 15px; font-weight: 700; width: 150px;">Time:</td>
                                <td style="padding: 16px 20px; color: #2d3748; font-size: 15px;">${new Date().toLocaleString()}</td>
                            </tr>
                            <tr style="background-color: #ffffff;">
                                <td style="padding: 16px 20px; color: #1a202c; font-size: 15px; font-weight: 700;">IP Address:</td>
                                <td style="padding: 16px 20px; color: #2d3748; font-size: 15px;">${clientIp || '::1'}</td>
                            </tr>
                            <tr style="background-color: #f7f9fa;">
                                <td style="padding: 16px 20px; color: #1a202c; font-size: 15px; font-weight: 700;">Location:</td>
                                <td style="padding: 16px 20px; color: #2d3748; font-size: 15px;">Bapatla</td>
                            </tr>
                        </table>
                    </div>

                    <div style="margin-bottom: 40px; border-bottom: 1px solid #e1e4e8; padding-bottom: 25px;">
                        <p style="color: #718096; font-size: 14px; margin: 0 0 5px 0;">If this was you, you can safely ignore this email.</p>
                        <p style="color: #4a5568; font-size: 14px; font-weight: 700; margin: 0;">If you did not log in, please reset your password immediately.</p>
                    </div>

                    <div style="text-align: center;">
                        <p style="color: #718096; font-size: 12px; margin: 0;">
                            © 2026 <span style="background-color: #fef08a; padding: 1px 3px; border-radius: 2px;">GeoValuator</span> Security Team
                        </p>
                    </div>
                </div>
            </div>
        `;
        sendEmail(email, 'Security Alert: New Login to GeoValuator', htmlAlert).catch(e => console.error(e));

        // 5. Generate Token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                preferred_location: user.preferred_location
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Login failed", details: error.message });
    }
};
