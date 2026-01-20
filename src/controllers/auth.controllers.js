import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.refreshTokenExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000)
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

const regsiterUser = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existingUser) {
        throw new ApiError(409, "User already exists with same email or username.")
    }

    const user = await User.create({
        email,
        username,
        password,
        isEmailVerified: false,
    })

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken()
})