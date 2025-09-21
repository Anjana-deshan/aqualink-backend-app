// Models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,       // emails must be unique if present
      sparse: true,       // allow multiple docs with no email
      trim: true,
      lowercase: true,
    },
    firstName: {
      type: String,
      default: "",        // optional for guests
    },
    lastName: {
      type: String,
      default: "",        // optional for guests
    },
    password: {
      type: String,
      default: "",        // optional for guests
    },
    role: {
      type: String,
      default: "User",
      enum: ["User", "Owner", "Admin", "Guest"],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default:
        "https://pixabay.com/vectors/blank-profile-picture-mystery-man-973460",
    },
  },
  { timestamps: true }
);

// Ensure index exists (drop old {email:1} index before adding this)
userSchema.index({ email: 1 }, { unique: true, sparse: true });

const User = mongoose.model("User", userSchema);
export default User;
