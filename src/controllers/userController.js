import dotenv from "dotenv";
dotenv.config();
import {UserProfile, userProfile } from "../models/userProfile.js"

export const createUserProfile = async(req , res) => {
  try {
    const {userId} = req.body;

    const data = req.body;

    const existingProfile = await userProfile.findOne({userId});
    if(existingProfile) return res.status(400).json({error: "Profile already exists"});

    const profile = await UserProfile.create({
      userId,
      ...data
    });

    res.json({
      message: "Profile created successfully",
      profile
    });
  } catch (error) {
    res.status(500).json({error: error.message});

  }
}

export const getUserProfile = async(req , res) => {
  try {
    const {userId} = req.user;
    const profile = await userProfile.findOne({userId});
    
    res.json({profile})
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const updateUserProfile = async (req , res) => {
  try {
    const {userId} = req.user;
    const updates = req.body;

    const updatedProfile = await userProfile.findOneAdUpdate(
      { userId },
      { $set: updates },
      { new: true }
    )

    res.json({
      message: "Profile updated Successfully",
      profile: updatedProfile
    });


  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

export const addOrUpdateEducation = async (req , res) => {
  try {
    const { userId } = req.user // from jwt
    const {mode , eduId , ...educationData} = req.body // frontend sending this data

    const profile = await UserProfile.findOne({ userId });
    if(!profile){
      return res.status(404).json({error: "Profile Not found"});
    }

    if ( mode == "add"){
      profile.education.push(educationData);
      await profile.save();

      return res.json({
      message: "Education added successfully",
      profile
    });
    }
    

    if(mode == "update"){
      const eduItem = profile.education.id(eduId);

      if(!eduId) return res.status(404).json({ error: "Education entry not found"});

      Object.assign(eduItem , educationData);
      await profile.save();

      return res.json({
        message: "Education updated successfully",
        profile
      });
    }
    return res.status(400).json({ error: "Invalid mode. Use 'add' or 'update'." });
  } catch (error) {
    console.log(error)
    res.status(500).json({error: error.message});
  }
};

export const deleteEducation = async (req , res) => {
  try {
    
  } catch (error) {
    
  }
}
