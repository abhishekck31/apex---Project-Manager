import Mailgen from "mailgen";

const emailVerificationMailGenContent = (user, verficationURL) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our App! we are excited to have you on board.",
            action: {
                instructions: "Please click on the button below to verify your email address.",
                button: {
                    color: 'rgba(52, 152, 219, 1)',
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
                    color: 'rgba(52, 152, 219, 1)',
                    text: 'Reset Password',
                    link: passwordResetURL
                },
            },
            outro:
                "Need help , or have questions ? Just reply to this email, we'd love to help you!"
        },
    };
};