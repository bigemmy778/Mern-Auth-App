
import dotenv from "dotenv";
dotenv.config(); // MUST BE AT THE VERY TOP
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; 

import  connectDB  from "./config/mongoDb.js";
import authRouter from "./routes.js/authRoutes.js";
import userRouter from "./routes.js/userRoutes.js";

//Create the app and port
const app = express();
const port = process.env.PORT || 4000
connectDB()
const allowedOrigins = ['http://localhost:5173']  // avoiding potential cors issues


// =============================== 
           // REQUEST LOGGER 
// =============================== 
// This helps us see what requests are 
// reaching the backend.

app.use((req, res, next) => {
    console.log(`REQUEST: ${req.method} ${req.url}`);
    console.log("CONTENT-TYPE:", req.headers["content-type"]);

    // Show the response status after the request finishes
    res.on("finish", () => {
        console.log(
            `RESPONSE: ${req.method} ${req.url} → ${res.statusCode}`
        );
    });

    next();
});


// 
//     console.log('REQUEST:', req.method, req.url);
//     console.log('CONTENT-TYPE:', req.headers['content-type']);
//     next();
// });

// MIDDLEWARE

app.use(express.json())  // Allow Express to read JSON request bodies
app.use(cookieParser())  // Allow Express to read cookies


// =============================== 
           // CORS
 // ===============================
app.use(cors({
    origin: 'https://mern-auth-frontend-k2wp.onrender.com',
    credentials: true
}));


// =============================== 
// DISABLE AUTHENTICATION CACHING 
// ===============================

// Authentication responses should never be cached.
// This prevents the browser from reusing an old
// "Not Authorized" response after the user has logged in.
app.use('/api/auth', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});



app.use('/api/user', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});



//API Endpoints
app.get('/', (req, res)=> res.send("API WORKING"))
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.listen(port, ()=> 
console.log(`Server started on PORT:${port}`
));


