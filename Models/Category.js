// backend: models/Category.js
import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    lowStockThreshold: {
      type: Number,
      required: true,
      default: 10,
      min: 0,
    },
  },
  { timestamps: true }
);

// Prevent OverwriteModelError in dev/hot-reload
const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
export default Category;
