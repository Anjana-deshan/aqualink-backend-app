import mongoose from "mongoose";

const inventoryHistorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  assignedSection: { type: String, default: "N/A" },
  quantity: { type: Number, required: true },
  dateTime: { type: Date, default: Date.now },
  user: { type: String, default: "Unknown User" },
  action: { type: String, enum: ["CREATED", "UPDATED", "DELETED", "ASSIGNED"], required: true },
  previousStock: { type: Number, default: 0 },
  newStock: { type: Number, default: 0 }
});

const InventoryHistory = mongoose.model("InventoryHistory", inventoryHistorySchema);
export default InventoryHistory;
