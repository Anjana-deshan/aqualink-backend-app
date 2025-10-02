import express from 'express';
import { addFeedback, getMyFeedback, getAllFeedback, updateFeedbackStatus, deleteFeedback, toggleTestimonial, getTestimonials } from '../controllers/feedbackController.js';

const feedbackRouter = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ 
      message: "Authentication required. Please log in to access this feature." 
    });
  }
  next();
};

// Public routes (require authentication)
feedbackRouter.post("/add", requireAuth, addFeedback);
feedbackRouter.get("/my-feedback", requireAuth, getMyFeedback);

// Public testimonials route (no authentication required)
feedbackRouter.get("/testimonials", getTestimonials);

// Admin routes (require authentication + admin role)
feedbackRouter.get("/all", requireAuth, getAllFeedback);
feedbackRouter.put("/:feedbackId/status", requireAuth, updateFeedbackStatus);
feedbackRouter.delete("/:feedbackId", requireAuth, deleteFeedback);
feedbackRouter.put("/:feedbackId/testimonial", requireAuth, toggleTestimonial);

export default feedbackRouter;
