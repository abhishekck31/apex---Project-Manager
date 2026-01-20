import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Apex",
            link: "https://apex.com"
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)
    const emailHTML = mailGenerator.generate(options.mailgenContent)
}



const emailVerificationMailGenContent = (user, verficationURL) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our App! we are excited to have you on board.",
            action: {
                instructions: "Please click on the button below to verify your email address.",
                button: {
                    color: '#3498dbff',
                    text: 'Verify Email Address',
                    link: verficationURL
                },
            },
            outro:
                "Need help , or have questions ? Just reply to this email, we'd love to help you!"
        },
    };
};

const forgotPasswordMailGenContent = (user, passwordResetURL) => {
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
    forgotPasswordMailGenContent
}