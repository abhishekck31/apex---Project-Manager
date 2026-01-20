import { Router } from "express";
import {
    registerUser,
    login,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    forgotPasswordRequest,
    resetPassword,
    verifyEmail,
    resendVerificationEmail
} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
    userRegisterValidator,
    userLoginValidator,
    userForgotPasswordValidator,
    userResetPasswordValidator,
    userChangePasswordValidator
} from "../validators/index.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"


const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:VerificationToken").get(verifyEmail);
router.route("/resend-verification").post(verifyJWT, resendVerificationEmail);
router.route("/change-password").post(verifyJWT, userChangePasswordValidator(), validate, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/forgot-password").post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(userResetPasswordValidator(), validate, resetPassword);

export default router;