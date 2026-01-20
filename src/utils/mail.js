import Mailgen from "mailgen";

const emailVerificationMailGenContent = (user, verficationURL) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our App! we are excited to have you on board.",
            action: {
                instructions: "Please click on the button below to verify your email address.",
                button: {
                    color: '#3498db',
                    text: 'Verify Email Address',
                    link: verficationURL
                }
            }
        }
    }
}