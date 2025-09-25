import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },

    // Amount in Rs
    amount: { type: Number, required: true, default: 0 },

    // CR = income, DR = expense
    type: { type: String, enum: ["CR", "DR"], required: true },

    /**
     * 'date' = the date the transaction happened (this is already used in your UI)
     * Keep this field name so the existing list/sorting/display don't change.
     */
    date: { type: Date, required: true },

    /**
     * NEW: recordedAt = the date/time the transaction was recorded/updated in the site.
     * (Shown as the second calendar in the form; defaults to "now" if not provided.)
     */
    recordedAt: { type: Date, default: () => new Date() },

    // Soft delete support
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true } // createdAt / updatedAt
);

export default mongoose.model("Transaction", TransactionSchema);
