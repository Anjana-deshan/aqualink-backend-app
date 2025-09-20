import mongoose from "mongoose";

const fishStockSchema = new mongoose.Schema(
  {
    fishCode: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    image: {
      type: String, // 👈 store Cloudinary image URL here
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);

const FishStock = mongoose.model("FishStock", fishStockSchema);

export default FishStock;
