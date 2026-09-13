import express from 'express';
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp,  verifyEmail } from '../controllers/authcontroller.js';
import 'dotenv/config';
import userAuth from '../middleware/userAuth.js';
import cookieParser from 'cookie-parser';
import connectDB from '../config/mongoDb.js';


const authRouter = express.Router();

//endpoints 
authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp)
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.get('/is-auth', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp',  sendResetOtp);
authRouter.post('/reset-password',  resetPassword);


export default authRouter
