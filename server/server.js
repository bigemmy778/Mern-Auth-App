
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

app.use((req, res, next) => {
    console.log('REQUEST:', req.method, req.url);
    console.log('CONTENT-TYPE:', req.headers['content-type']);
    next();
});
app.use(express.json())
app.use(cookieParser())
app.use(cors({ 
    origin: 'http://localhost:5173',
    credentials: true
}))

//API Endpoints
app.get('/', (req, res)=> res.send("API WORKING"))
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.listen(port, ()=> console.log(`Server started on PORT:${port}`))


