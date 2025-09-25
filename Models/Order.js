import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  title: { type: String, required: true }, // snapshot
  price: { type: Number, required: true }, // snapshot
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      fullName: String,
      phone: String,
      address: String,
      city: String,
      postalCode: String,
      country: String,
    },
    payment: {
      method: {
        type: String,
        enum: ["cash_on_delivery", "credit_card", "paypal"],
        default: "cash_on_delivery",
      },
      isPaid: { type: Boolean, default: false },
      paidAt: Date,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
