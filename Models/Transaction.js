// Models/Transaction.js
import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["CR", "DR"], required: true },
    date: { type: Date, default: Date.now },

    orderId: { type: String },
    staffId: { type: String },

    createdByRole: { type: String, default: "owner" },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

TransactionSchema.index({ name: "text", description: "text" });

export default mongoose.model("Transaction", TransactionSchema);
