import mongoose from "mongoose";

const fishInventorySchema = new mongoose.Schema(
  {
    itemCode: {
      type: String,
      required: true,
      unique: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);

const FishInventory = mongoose.model("FishInventory", fishInventorySchema);

export default FishInventory;
