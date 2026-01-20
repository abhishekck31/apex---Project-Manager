import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Apex",
            link: "https://apex.com"
        }
    });

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)
    const emailHTML = mailGenerator.generate(options.mailgenContent)

    console.log("Sending email with config:", {
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        user: process.env.MAILTRAP_SMTP_USER,
        secure: process.env.MAILTRAP_SMTP_PORT == 465,
    });

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        secure: process.env.MAILTRAP_SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    })

    const mail = {
        from: "mail.apex@abhishek.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHTML
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Email Service Failed siliently.Make Sure you have provided correct SMTP credentials")
        console.error("Error : ", error)
    }
};

const emailVerificationMailGenContent = (username, verificationURL) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our App! we are excited to have you on board.",
            action: {
                instructions: "Please click on the button below to verify your email address.",
                button: {
                    color: '#3498dbff',
                    text: 'Verify Email Address',
                    link: verificationURL
                },
            },
            outro:
                "Need help , or have questions ? Just reply to this email, we'd love to help you!"
        },
    };
};

const forgotPasswordMailGenContent = (username, passwordResetURL) => {
    return {
        body: {
            name: username,
            intro: "You have requested to reset your password.",
            action: {
                instructions: "Please click on the button below to reset your password.",
                button: {
                    color: '#3498dbff',
                    text: 'Reset Password',
                    link: passwordResetURL
                },
            },
            outro:
                "Need help , or have questions ? Just reply to this email, we'd love to help you!"
        },
    };
};

export {
    emailVerificationMailGenContent,
    forgotPasswordMailGenContent,
    sendEmail
};