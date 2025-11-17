import dotenv from "dotenv";
dotenv.config();
import {UserProfile} from "../models/userProfile.js"

export const createUserProfile = async(req , res) => {
  try {
    const {userId} = req.user;

    const data = req.body;

    const existingProfile = await UserProfile.findOne({userId});
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
    const profile = await UserProfile.findOne({userId});
    
    res.json({profile})
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const updateUserProfile = async (req , res) => {
  try {
    const {userId} = req.user;
    const updates = req.body;

    const updatedProfile = await UserProfile.findOneAndUpdate(
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

      if(!eduItem) return res.status(404).json({ error: "Education entry not found"});

      Object.assign(eduItem , educationData);
      await profile.save();

      return res.json({
        message: "Education updated successfully",
        profile
      });
    }
    return res.status(400).json({ error: "Invalid mode. Use 'add' or 'update'." });
  } catch (error) {
    console.error(error)
    res.status(500).json({error: error.message});
  }
};

export const deleteEducation = async (req , res) => {
  try {
    const { userId } = req.user;
    const { eduId } = req.params;

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $pull : {education: {_id: eduId}}}, // remove matching subdocument
      { new: true}
    )

    if(!updatedProfile){
      return res.status(404).json({error: "Profile not found"});
    }

    return res.json({
      message: "Education entry deleted successfully",
      profile: updatedProfile
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({error: error.message})
  }
};

export const addOrUpdateExperience = async (req, res) => {
  try {
    const { userId } = req.user;  // From JWT
    const { mode, expId, ...experienceData } = req.body;

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    //  ADD NEW EXPERIENCE
    if (mode === "add") {
      profile.experience.push(experienceData);
      await profile.save();

      return res.json({
        message: "Experience added successfully",
        profile
      });
    }

    //  UPDATE EXISTING EXPERIENCE
    if (mode === "update") {
      const expItem = profile.experience.id(expId);

      if (!expItem) {
        return res.status(404).json({ error: "Experience entry not found" });
      }

      Object.assign(expItem, experienceData);
      await profile.save();

      return res.json({
        message: "Experience updated successfully",
        profile
      });
    }

    return res.status(400).json({
      error: "Invalid mode. Use 'add' or 'update'."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


export const deleteExperience = async (req, res) => {
  try {
    const { userId } = req.user;
    const { expId } = req.params;

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $pull: { experience: { _id: expId } } },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.json({
      message: "Experience entry deleted successfully",
      profile: updatedProfile
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
