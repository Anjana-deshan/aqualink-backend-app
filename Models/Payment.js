// Models/Payment.js
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    buyerId: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, default: "cash" },
    description: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", PaymentSchema);
