import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail, emailVerificationMailGenContent, forgotPasswordMailGenContent } from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        console.error("Token Generation Error:", error)
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, role, fullName } = req.body

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existingUser) {
        throw new ApiError(409, "User already exists with same email or username.")
    }

    const user = await User.create({
        email,
        username,
        fullName,
        password,
        isEmailVerified: false,
    })

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendEmail(
        {
            email: user.email,
            subject: "Verify your email",
            mailgenContent: emailVerificationMailGenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify/${unHashedToken}`
            ),
        }
    );

    const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                { user: createdUser },
                "User registered successfully")
        )
});

const login = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body

    if (!username && !email) {
        throw new ApiError(400, "Please provide username or email")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedinUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry");

    if (!loggedinUser) {
        throw new ApiError(500, "Something went wrong while logging in user")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedinUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully")
        )


});

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            },
        },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully")
        )
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "User fetched successfully")
        )
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { VerificationToken } = req.params
    const user = await User.findOne({
        emailVerificationToken: VerificationToken,
        emailVerificationTokenExpiry: { $gt: Date.now() }
    })
    if (!user) {
        throw new ApiError(404, "Invalid or expired token")
    }
    user.isEmailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationTokenExpiry = undefined
    await user.save({ validateBeforeSave: false })
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Email verified successfully")
        )
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken()
    user.forgotPasswordToken = hashedToken
    user.forgotPasswordTokenExpiry = tokenExpiry
    await user.save({ validateBeforeSave: false })

    await sendEmail({
        email: user.email,
        subject: "Reset Password",
        mailgenContent: forgotPasswordMailGenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/reset-password/${unHashedToken}`
        )
    })

    return res.status(200).json(new ApiResponse(200, {}, "Password reset email sent successfully"))
})

const resetPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params
    const { newPassword } = req.body

    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: { $gt: Date.now() }
    })

    if (!user) {
        throw new ApiError(400, "Invalid or expired token")
    }

    user.password = newPassword
    user.forgotPasswordToken = undefined
    user.forgotPasswordTokenExpiry = undefined
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"))
})

const resendVerificationEmail = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id)

    if (user.isEmailVerified) {
        throw new ApiError(400, "Email already verified")
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken()
    user.emailVerificationToken = hashedToken
    user.emailVerificationTokenExpiry = tokenExpiry
    await user.save({ validateBeforeSave: false })

    await sendEmail({
        email: user.email,
        subject: "Verify Email",
        mailgenContent: emailVerificationMailGenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify/${unHashedToken}`
        )
    })

    return res.status(200).json(new ApiResponse(200, {}, "Verification email resent successfully"))
})

export {
    registerUser,
    login,
    logOutUser,
    getCurrentUser,
    verifyEmail,
    refreshAccessToken,
    changeCurrentPassword,
    forgotPasswordRequest,
    resetPassword,
    resendVerificationEmail
}