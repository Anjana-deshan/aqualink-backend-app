import { json } from "express";
import User from "../Models/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export function createUser(req,res){
    
    const hashedPassword = bcrypt.hashSync(req.body.password,10)

    const user = new User(
        {
            email : req.body.email,
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            password : hashedPassword,
            role : req.body.role || "User"
        }
    )

    user.save().then(
        ()=>{
            res.json({
                message: "User Created successfully"
            })
        }
    ).catch(
        ()=>{
            res.json({
                message: "Failed to create User"
            })
        }
    )
}

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // exclude password
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

export function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatching = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatching) {
      return res.status(401).json({ message: "Login failed" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      "jwt-secret-key",
      { expiresIn: "7d" } // optional, adjust as needed
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  }).catch(err => {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  });
}

// LIST (NEW) – minimal fields for dropdown, optional ?role=Staff
export async function listUsers(req, res) {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    const users = await User.find(
      filter,
      "email firstName lastName role isBlocked"
    ).lean();
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch users", error: e.message });
  }
}

export function isAdmin(req){
    if(req.user == null){
        return false;
    }
    if(req.user != "admin"){
        return false;
    }
    return true;
}

export function updateUser(req, res) {
    const userEmail = req.params.email || req.body.email;
    
    if (!userEmail) {
        return res.status(400).json({
            message: "User email is required"
        });
    }

    // Create update object with only provided fields
    const updateData = {};
    if (req.body.firstName) updateData.firstName = req.body.firstName;
    if (req.body.lastName) updateData.lastName = req.body.lastName;
    if (req.body.role) updateData.role = req.body.role;
    if (req.body.isBlocked !== undefined) updateData.isBlocked = req.body.isBlocked;
    if (req.body.isEmailVerified !== undefined) updateData.isEmailVerified = req.body.isEmailVerified;
    if (req.body.image) updateData.image = req.body.image;

    // If password is provided, hash it
    if (req.body.password) {
        updateData.password = bcrypt.hashSync(req.body.password, 10);
    }

    User.findOneAndUpdate(
        { email: userEmail },
        updateData,
        { new: true, runValidators: true }
    ).then(
        (updatedUser) => {
            if (!updatedUser) {
                return res.status(404).json({
                    message: "User not found"
                });
            }
            res.json({
                message: "User updated successfully",
                user: {
                    email: updatedUser.email,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    role: updatedUser.role,
                    isBlocked: updatedUser.isBlocked,
                    isEmailVerified: updatedUser.isEmailVerified,
                    image: updatedUser.image
                }
            });
        }
    ).catch(
        (error) => {
            console.error("Update error:", error);
            res.status(500).json({
                message: "Failed to update user",
                error: error.message
            });
        }
    );
}

export function deleteUser(req, res) {
    const userEmail = req.params.email || req.body.email;
    
    if (!userEmail) {
        return res.status(400).json({
            message: "User email is required"
        });
    }

    User.findOneAndDelete({ email: userEmail }).then(
        (deletedUser) => {
            if (!deletedUser) {
                return res.status(404).json({
                    message: "User not found"
                });
            }
            res.json({
                message: "User deleted successfully",
                deletedUser: {
                    email: deletedUser.email,
                    firstName: deletedUser.firstName,
                    lastName: deletedUser.lastName
                }
            });
        }
    ).catch(
        (error) => {
            console.error("Delete error:", error);
            res.status(500).json({
                message: "Failed to delete user",
                error: error.message
            });
        }
    );
}

export const changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "Email, current password, and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};