import Feedback from "../Models/Feedback.js";
import User from "../Models/user.js";

/**
 * POST /api/feedback/add
 * Body: { name: string, email: string, feedback: string, rating?: number }
 * Requires: User must be logged in (JWT token)
 */
export const addFeedback = async (req, res) => {
  try {
    console.log("📩 POST /api/feedback/add", req.body);
    
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.error("❌ addFeedback: User not authenticated");
      return res.status(401).json({ 
        message: "Authentication required. Please log in to submit feedback." 
      });
    }

    const { name, email, feedback, rating } = req.body;

    // Validate required fields
    if (!name || !email || !feedback) {
      console.error("❌ addFeedback: Missing required fields");
      return res.status(400).json({ 
        message: "Missing required fields. Name, email, and feedback are required." 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("❌ addFeedback: Invalid email format");
      return res.status(400).json({ 
        message: "Please provide a valid email address." 
      });
    }

    // Validate feedback length
    if (feedback.length < 10) {
      console.error("❌ addFeedback: Feedback too short");
      return res.status(400).json({ 
        message: "Feedback must be at least 10 characters long." 
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5 || !Number.isInteger(Number(rating)))) {
      console.error("❌ addFeedback: Invalid rating");
      return res.status(400).json({ 
        message: "Rating must be an integer between 1 and 5." 
      });
    }

    // Verify user exists
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error("❌ addFeedback: User not found");
      return res.status(404).json({ 
        message: "User not found. Please log in again." 
      });
    }

    // Create new feedback
    const newFeedback = new Feedback({
      userId: req.user._id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      feedback: feedback.trim(),
      rating: rating ? Number(rating) : null,
      status: "pending"
    });

    const savedFeedback = await newFeedback.save();

    console.log("✅ Feedback submitted successfully:", savedFeedback._id);
    
    return res.status(201).json({
      message: "Feedback submitted successfully! Thank you for your input.",
      feedback: {
        id: savedFeedback._id,
        name: savedFeedback.name,
        email: savedFeedback.email,
        feedback: savedFeedback.feedback,
        rating: savedFeedback.rating,
        status: savedFeedback.status,
        createdAt: savedFeedback.createdAt
      }
    });

  } catch (err) {
    console.error("❌ addFeedback error:", err);
    
    // Handle duplicate feedback submission (if needed)
    if (err.code === 11000) {
      return res.status(409).json({ 
        message: "You have already submitted feedback recently. Please wait before submitting again." 
      });
    }

    return res.status(500).json({ 
      message: "Error submitting feedback. Please try again later.", 
      error: err?.message || String(err) 
    });
  }
};

/**
 * GET /api/feedback/my-feedback
 * Returns feedback submitted by the authenticated user
 * Requires: User must be logged in
 */
export const getMyFeedback = async (req, res) => {
  try {
    console.log("📩 GET /api/feedback/my-feedback");
    
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.error("❌ getMyFeedback: User not authenticated");
      return res.status(401).json({ 
        message: "Authentication required." 
      });
    }

    const feedback = await Feedback.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

    return res.status(200).json({
      message: "Feedback retrieved successfully",
      feedback: feedback,
      count: feedback.length
    });

  } catch (err) {
    console.error("❌ getMyFeedback error:", err);
    return res.status(500).json({ 
      message: "Error retrieving feedback.", 
      error: err?.message || String(err) 
    });
  }
};

/**
 * GET /api/feedback/all (Admin only)
 * Returns all feedback with user details
 * Requires: Admin role
 */
export const getAllFeedback = async (req, res) => {
  try {
    console.log("📩 GET /api/feedback/all");
    
    // Check if user is authenticated and is admin/owner
    if (!req.user || !req.user._id) {
      console.error("❌ getAllFeedback: User not authenticated");
      return res.status(401).json({ 
        message: "Authentication required." 
      });
    }

    // Check if user has admin privileges (adjust role check based on your system)
    const user = await User.findById(req.user._id);
    if (!user || (user.role !== "Admin" && user.role !== "owner")) {
      console.error("❌ getAllFeedback: Insufficient permissions");
      return res.status(403).json({ 
        message: "Access denied. Admin privileges required." 
      });
    }

    const feedback = await Feedback.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

    return res.status(200).json({
      message: "All feedback retrieved successfully",
      feedback: feedback,
      count: feedback.length
    });

  } catch (err) {
    console.error("❌ getAllFeedback error:", err);
    return res.status(500).json({ 
      message: "Error retrieving feedback.", 
      error: err?.message || String(err) 
    });
  }
};

/**
 * PUT /api/feedback/:feedbackId/status (Admin only)
 * Updates feedback status
 * Requires: Admin role
 */
export const updateFeedbackStatus = async (req, res) => {
  try {
    console.log("📩 PUT /api/feedback/:feedbackId/status", req.params.feedbackId);
    
    // Check if user is authenticated and is admin/owner
    if (!req.user || !req.user._id) {
      console.error("❌ updateFeedbackStatus: User not authenticated");
      return res.status(401).json({ 
        message: "Authentication required." 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user || (user.role !== "Admin" && user.role !== "owner")) {
      console.error("❌ updateFeedbackStatus: Insufficient permissions");
      return res.status(403).json({ 
        message: "Access denied. Admin privileges required." 
      });
    }

    const { feedbackId } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "reviewed", "responded"].includes(status)) {
      console.error("❌ updateFeedbackStatus: Invalid status");
      return res.status(400).json({ 
        message: "Invalid status. Must be 'pending', 'reviewed', or 'responded'." 
      });
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      console.error("❌ updateFeedbackStatus: Feedback not found");
      return res.status(404).json({ 
        message: "Feedback not found." 
      });
    }

    console.log("✅ Feedback status updated successfully");
    
    return res.status(200).json({
      message: "Feedback status updated successfully",
      feedback: updatedFeedback
    });

  } catch (err) {
    console.error("❌ updateFeedbackStatus error:", err);
    return res.status(500).json({ 
      message: "Error updating feedback status.", 
      error: err?.message || String(err) 
    });
  }
};
