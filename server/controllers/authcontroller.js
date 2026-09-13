import bcrypt from 'bcryptjs';  // Import bcryptjs. // We use bcrypt to securely hash the user's password before saving it.
import transporter from '../config/nodemailer.js';// Import the user model.
import userModel from '../models/userModel.js';// This model is used to communicate with the users collection in MongoDB.
import jwt from 'jsonwebtoken'; // Import jsonwebtoken. // We use JWT to create an authentication token for the user.
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';



// Register function.
// This function runs when a user sends a request to create an account.
export const register = async (req, res) => {

    // Get name, email, and password from the request body.
    // These are the details the user submitted from the frontend.
    const { name, email, password } = req.body;


    // Check if any of the required fields are missing.
    // The ! means "does not have a value".
    if (!name || !email || !password) {

        // Stop the function and send a response to the frontend.
        return res.json({
            success: false,
            message: 'Missing Details'
        });
    }


    // try is used because database operations can fail.
    // If something goes wrong, the catch block will handle the error.
    try {

        // Search MongoDB for a user whose email matches the email
        // submitted by the new user.
        const existingUser = await userModel.findOne({ email });


        // Check if a user with this email already exists.
        if (existingUser) {

            // Stop the function and tell the frontend
            // that the email is already registered.
            return res.json({
                success: false,
                message: 'user already exists'
            });
        }


        // Hash the user's password before saving it.
        // "10" is the number of salt rounds used by bcrypt.
        // We NEVER want to save the user's plain-text password.
        const hashedPassword = await bcrypt.hash(password, 10);


        // Create a new user using our Mongoose user model.
        // We save the hashed password instead of the original password.
        const user = new userModel({
            name,
            email,
            password: hashedPassword
        });


        // Save the newly created user to MongoDB.
        await user.save();


        // Create a JWT authentication token.
        // The user's MongoDB ID is stored inside the token.
        // The token will expire after 7 days.
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );


        // Send the JWT token to the browser as a cookie.
        res.cookie('token', token, {

            // Prevent JavaScript in the browser from accessing the cookie.
            // This helps protect the token from certain attacks.
            httpOnly: true,

            // Only send the cookie over HTTPS in production.
            secure: process.env.NODE_ENV === 'production',

            // Controls when the browser is allowed to send the cookie
            // with cross-site requests.
            sameSite:
                process.env.NODE_ENV === 'production'
                    ? 'none'
                    : 'strict',

            // Keep the cookie for 7 days.
            // The value is calculated in milliseconds.
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        //Sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to FelzStack",
            text: `Welcome to FelzStack website, your acount has been created with email id: ${email} let us know if this was a mistake`
        }

        await transporter.sendMail(mailOptions);



        return res.json({ success: true }) //generate response


    } catch (error) {
        // If something goes wrong, send the error message
        // back to the frontend.
        res.json({
            success: false,
            message: error.message
        });
    }
};


// creating the login function
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: 'Email and password are required' })
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'Invalid email' })
        }
        //we want to check if user password is the same with the one in the mongoDb
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid password' })
        }

        //generate the token to login 

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );


        // Send the JWT token to the browser as a cookie.
        res.cookie('token', token, {

            // Prevent JavaScript in the browser from accessing the cookie.
            // This helps protect the token from certain attacks.
            httpOnly: true,

            // Only send the cookie over HTTPS in production.
            secure: process.env.NODE_ENV === 'production',

            // Controls when the browser is allowed to send the cookie
            // with cross-site requests.
            sameSite:
                process.env.NODE_ENV === 'production'
                    ? 'none'
                    : 'strict',

            // Keep the cookie for 7 days.
            // The value is calculated in milliseconds.
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true })


    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


// creating the logout function

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({ success: true, message: "Logged out" })
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


// Send Verification OTP to the user's email
export const sendVerifyOtp = async (req, res) => {
    try {

        // Get the logged-in user's ID from the authentication middleware
        const userId = req.userId;

        // Find the user in MongoDB using their ID
        const user = await userModel.findById(userId);

        // Make sure the user actually exists
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        // Don't send another OTP if the account is already verified
        if (user.isAccountVerified) {
            return res.json({
                success: false,
                message: "Account Already Verified"
            });
        }

        // Generate a random 6-digit OTP
        const otp = String(
            Math.floor(100000 + Math.random() * 900000)
        );

        // Save the OTP in the user's MongoDB document
        user.verifyOtp = otp;

        // Make the OTP expire after 10 minutes
        user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;

        // Save the updated user information to MongoDB
        await user.save();

        console.log("EMAIL TEMPLATE:",EMAIL_VERIFY_TEMPLATE)

        // Create the email that will be sent to the user
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            // text: `Your OTP is ${otp}. Verify your account using this OTP`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp)
            .replace("{{email}}", user.email)
        };

        // Send the OTP email using Nodemailer
        await transporter.sendMail(mailOption);

        // Tell the frontend that the email was sent successfully
        return res.json({
            success: true,
            message: 'Verification OTP Sent on Email'
        });

    } catch (error) {

        // Log the error if something goes wrong
        console.log("SEND OTP ERROR:", error);

        // Send the error message back to the frontend
        return res.json({
            success: false,
            message: error.message
        });
    }
};


// verify email using OTP
export const verifyEmail = async (req, res) => {
    console.log("REQ BODY:", req.body);
    console.log("REQ USER ID:", req.userId);
    console.log("COOKIES:", req.cookies);

    // Get the OTP from the frontend.
    const { otp } = req.body;

    // Get the user's ID from the authentication middleware.
    // userAuth gets the ID from the JWT cookie and puts it in req.userId.
    const userId = req.userId;

    // Make sure we have both the user ID and OTP.
    if (!userId || !otp) {
        return res.json({
            success: false,
            message: 'Missing Details'
        });
    }

    try {

        // Find the logged-in user in MongoDB.
        const user = await userModel.findById(userId);

        // If the user doesn't exist, stop here.
        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if the OTP entered by the user
        // matches the OTP stored in MongoDB.
        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check if the OTP has expired.
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({
                success: false,
                message: 'OTP Expired'
            });
        }

        // Mark the user's account as verified.
        user.isAccountVerified = true;

        // Clear the OTP after successful verification.
        user.verifyOtp = '';

        // Clear the OTP expiration time.
        user.verifyOtpExpireAt = 0;

        // Save the changes to MongoDB.
        await user.save();

        return res.json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {

        return res.json({
            success: false,
            message: error.message
        });
    }
};


//check if user is authenticated 
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Send Password Reset OTP
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: 'email is required' })
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000)) // creating the otp

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000 // otp stays for 24 hours

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: ` your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}", user.email)
        }

        await transporter.sendMail(mailOption);

        return res.json({ success: true, message: 'OTP sent to your email' });

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

// Reset User Passowrd
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'Email, OTP, and new password are required' })
    }

    try {
         
        const user = await userModel.findOne({email});
        if (!user){
            return res.json({ success: false, message: 'User not found'});
        }
        // if the otp feild is empty or not equall to otp
        if (user.resetOtp === '' || user.resetOtp !== otp){
             return res.json({ success: false, message: 'Invalid OTP'})
        }

           if (user.resetOtpExpire < Date.now()){
             return res.json({ success: false, message: 'OTP Expired' });
           }

           const hashedPassword = await bcrypt.hash(newPassword, 10); // hash the new password
           //update it in the mongoDB
           user.password = hashedPassword
           user.resetOtp = '';
           user.resetOtpExpire = 0;

           await user.save();

            return res.json({ success: true, message: 'Password has been reset successfully' });
            

    } catch (error) {
        return res.json({ success: false, message: error.message });

    }
}
