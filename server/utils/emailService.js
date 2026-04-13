const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'demo_user@gmail.com') {
            console.log(`\n[MOCK EMAIL SERVICE]`);
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Content: ${html.substring(0, 50)}...`);
            console.log(`------------------------------------------\n`);
            return true;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SENT] To: ${to}`);
        return true;
    } catch (error) {
        console.error('[EMAIL ERROR]', error.message);
        throw error; // Rethrow to let caller handle failure
    }
};

module.exports = { sendEmail };
