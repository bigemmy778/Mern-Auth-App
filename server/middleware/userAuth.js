import jwt from 'jsonwebtoken';


//this middleware will be excecuted whenever we hit the api end point
const userAuth  = async (req, res, next) => {
    const  {token} = req.cookies; //get the token from the cookie

    if(!token){
       return res.json({success: false, message: 'Not Authorized, Login Again'})
    }

    try{
       const tokenDecode = jwt.verify(token, process.env.JWT_SECRET); // decode and get the user id 

       if(tokenDecode.id){ // that user id will be added into the request body
        req.userId = tokenDecode.id;
        // req.body.userId = tokenDecode.id
       }else{
        return res.json({ success: false, message: 'Not authorized, Login Again' });
       }

       next() //execute our controller functionn

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export default userAuth

//using the useAuth and controller function will create the api Endpoint
