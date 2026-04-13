require('dotenv').config();
const nodemailer = require('nodemailer');

async function verifyEmail() {
    console.log('--- Email Configuration Verification ---');
    console.log(`User: ${process.env.EMAIL_USER}`);

    if (!process.env.EMAIL_PASS || process.env.EMAIL_PASS.includes('replace_with')) {
        console.error('❌ ERROR: EMAIL_PASS is not set or contains placeholder text.');
        console.log('   Please Open .env file and set EMAIL_PASS to your Google App Password.');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log('Validating credentials with Gmail...');
        await transporter.verify();
        console.log('✅ Success: Server is ready to take our messages');

        console.log('Attempting to send a test email to yourself...');
        const info = await transporter.sendMail({
            from: `"GeoValuator Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'GeoValuator Email Test',
            text: 'If you are reading this, your email configuration is working correctly!',
            html: '<b>If you are reading this, your email configuration is working correctly!</b>'
        });

        console.log('✅ Test email sent successfully!');
        console.log(`   Message ID: ${info.messageId}`);
    } catch (error) {
        console.error('❌ Error verifying email configuration:');
        console.error(error.message);
        if (error.code === 'EAUTH') {
            console.log('\n💡 Tip: Check if your App Password is correct and 2-Step Verification is enabled.');
        }
    }
}

verifyEmail();
