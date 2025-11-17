import jwt from "jsonwebtoken";

export const authMiddleware = (req , res , next) => {

  try {
    // Get token from request header
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
      return res.status(401).json({error : "Access denied. No token provided"});
    } 

    const token = authHeader.split(" ")[1];
    
    //Verify the token
    const decoded = jwt.verify(token , process.env.JWT_SECRET);

    // Attach user data to request object
    req.user = decoded;

    // Continue to next middleware / controller
    next();
  } catch (error) {
    console.error("Auth Error" , error.message);
    return res.status(401).json({error: "Invalid or expired token"});
  }
};