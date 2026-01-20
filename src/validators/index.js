import { body } from "express-validator";

const userRegisterValidator = () => {
    return [
        body("username")
            .trim()
            .notEmpty()
            .isLowercase()
            .isLength({ min: 3 })
            .withMessage("Username must be lowercase and at least 3 characters long"),
        body("email")
            .trim()
            .notEmpty()
            .isEmail()
            .withMessage("Email is required"),
        body("fullName")
            .trim()
            .notEmpty()
            .withMessage("Full name is required"),
        body("password")
            .trim()
            .notEmpty()
            .isLowercase()
            .withMessage("Password must be lowercase")
            .isLength({ min: 3 })
            .withMessage("Password must be at least 3 characters long"),
    ]
};

const userLoginValidator = () => {
    return [
        body("email")
            .optional()
            .isEmail()
            .withMessage("Email is required"),
        body("username")
            .optional(),
        body("password")
            .notEmpty()
            .withMessage("Password is required"),
    ]
};


const userForgotPasswordValidator = () => {
    return [
        body("email")
            .notEmpty()

            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
    ]
}

const userResetPasswordValidator = () => {
    return [
        body("newPassword")
            .notEmpty()
            .withMessage("Password is required"),
    ]
}

const userChangePasswordValidator = () => {
    return [
        body("oldPassword")
            .notEmpty()
            .withMessage("Old password is required"),
        body("newPassword")
            .notEmpty()
            .withMessage("New password is required"),
    ]
}

export {
    userRegisterValidator,
    userLoginValidator,
    userForgotPasswordValidator,
    userResetPasswordValidator,
    userChangePasswordValidator
}