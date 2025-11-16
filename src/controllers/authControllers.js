import dotenv from "dotenv";
dotenv.config();
import { json } from "express";
import { UserAuth } from "../models/userAuthSchema";
import bycrypt from "bycryptjs"
import jwt from "jsonwebtoken"

export const signup = async(req , res) => {
  try {
    const {name , email , password} = req.body;

    const existing = await UserAuth.findOne({email});

    if(existing){
      res.status(400).json({error : "Email already registered"});
    }

    const hashedPassword = await bycrypt.hash(password , 10);

    const user = await UserAuth.create({
      name,email,password:hashedPassword
    });

    const token = jwt.sign(
      { userId : user.userId , email: user.email
      }, 
      process.env.JWT_SECRET,
      {expiresIn: "7d"}
    );

    res.json({
      message: "SignUp Successfull",
      token,
      userId: user.userId,
      name: user.name,
      email: user.email
    });

  } catch (error) {
    res.status(500).json({error: error.message})
  }
};


export const login = async (req , res) => {
  try {
    const {email , password} = req.body()

    const user = await user.findOne({email});

    if(!user) return res.status(404).json({error: "User not found or Registered"});

    const match = await bycrypt.compare(password , user.password);
    if(!match) return res.status(400).json({error : "Incorrrect password"});

    const token = jwt.sign(
      {userId : user.userId , email: user.email },
      process.env.JWT_SECRET,
      {expiresIn: "7d"}
    );

    res.json({
      message: "Login Successful",
      token,
      userId: user.userId,
      email: user.email,
      name: user.name
    });

  } catch (error) {
    res.status(500).json({error: error.message});
  }
};