import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        feedbackID: {
            type: String,
            unique: true,
            sparse: true // This allows multiple null values
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        feedback: {
            type: String,
            required: true,
            trim: true,
            maxLength: 200
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "responded"],
            default: "pending"
        },
        isTestimonial: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Create indexes for better query performance
feedbackSchema.index({ userId: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ status: 1 });

// Update the updatedAt field before saving
feedbackSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
