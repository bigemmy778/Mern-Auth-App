// Import jsonwebtoken so we can check that a token is real and not tampered with.
import jwt from 'jsonwebtoken';

// This middleware runs BEFORE any protected controller function.
// Its job is to answer one question: "Is this user logged in?"
// req = the incoming request, res = our reply, next = "continue to the controller".
const userAuth = async (req, res, next) => {

    // Look for a header named "Authorization" in the request.
    // The frontend will send it like this: "Bearer eyJhbGciOi..."
    const authHeader = req.headers.authorization;

    // Now we get the token from one of two places:
    // 1. If the header exists and starts with "Bearer ", we take the token from it.
    //    This is the path phones will use.
    // 2. Otherwise, we fall back to the old cookie, so desktop users
    //    who are already logged in keep working.
    const token = authHeader?.startsWith('Bearer ')

        // Split "Bearer abc123" at the space into ["Bearer", "abc123"],
        // then take the second piece, which is the actual token.
        ? authHeader.split(' ')[1]

        // No header found, so try the cookie.
        // The "?." stops the code from crashing if req.cookies is undefined.
        : req.cookies?.token;

    // If we found no token in either place, the user is not logged in.
    // We stop here and tell the frontend, so the controller never runs.
    if (!token) {
        return res.json({ success: false, message: 'Not Authorized, Login Again' });
    }

    // try is used because jwt.verify throws an error if the token is
    // fake, expired, or damaged. The catch block below handles that.
    try {

        // Check the token using our secret key from the .env file.
        // If it is valid, we get back the data we stored inside it
        // (the user's MongoDB id).
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        // Make sure the token actually contains a user id.
        // If it doesn't, reject the request.
        if (!tokenDecode.id) {
            return res.json({ success: false, message: 'Not Authorized, Login Again' });
        }

        // Save the user's id on the request object.
        // Our controllers (like sendVerifyOtp and verifyEmail)
        // read it later using req.userId.
        req.userId = tokenDecode.id;

        // Everything is fine, so move on to the actual controller function.
        next();

    } catch (error) {

        // The token was fake, expired, or broken.
        // We send a simple message instead of the raw error,
        // so users don't see technical text like "jwt malformed".
        return res.json({ success: false, message: 'Not Authorized, Login Again' });
    }
};

// Export the middleware so our routes file can use it.
export default userAuth;

//using the useAuth and controller function will create the api Endpoint
