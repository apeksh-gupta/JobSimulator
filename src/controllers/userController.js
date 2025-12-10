import dotenv from "dotenv";
dotenv.config();
import { UserProfile } from "../models/userProfile.js";

// -----------------------------------------
// CREATE PROFILE (only once after signup)
// -----------------------------------------
export const createUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const data = req.body;

    const existingProfile = await UserProfile.findOne({ userId });
    if (existingProfile)
      return res.status(400).json({ error: "Profile already exists" });

    const profile = await UserProfile.create({
      userId,
      ...data,
    });

    res.json({
      message: "Profile created successfully",
      profile,
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// -----------------------------------------
// GET AUTHENTICATED USER'S PROFILE
// -----------------------------------------
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    const profile = await UserProfile.findOne({ userId });

    return res.json({ profile });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// -----------------------------------------
// UPDATE FULL PROFILE (Education + Experience + Base Info)
// -----------------------------------------
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const updates = req.body;

    // This cleanly replaces entire arrays + simple fields
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      updates,
      { new: true, runValidators: true }
    );

    return res.json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
