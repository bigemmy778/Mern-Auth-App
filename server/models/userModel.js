// import { verify } from "jsonwebtoken";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // meaning we cannnot use one email twice
    },
    password: {
        type: String,
        required: true,
    },

    // we do not have to provide this it will authomatically be added for new user
    verifyOtp: {
        type: String,
        default: '',
    },
    verifyOtpExpireAt: {
        type: Number,
        default: '',
    },
    isAccountVerified: {
        type: Boolean,
        default: false,
    },
    resetOtp: {
        type: String,
        default: '',
    },
    resetOtpExpiredAt: {
        type: Number,
        default: 0 
    }
})


const userModel = mongoose.models.user || mongoose.model('user', userSchema)

export default userModel