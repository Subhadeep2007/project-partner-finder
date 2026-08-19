import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
});

const sendEmail = async({ to, subject, html }) => {
    const mailOptions = {
        from: `"Project Partner Finder" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;