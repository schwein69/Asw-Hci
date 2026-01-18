import Feedback from "../models/feedback.js";
import User from "../models/users.js";

// Create new feedback
export const createFeedback = async (req, res) => {
  try {
    const { userId, category, subject, message, rating } = req.body;

    if (!userId || !category || !subject || !message || !rating) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Get user's name
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create feedback
    const feedback = new Feedback({
      user: userId,
      userName: user.username || user.email.split("@")[0],
      category,
      subject,
      message,
      rating,
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully!",
      feedback,
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
};

// Get all community feedback
export const getCommunityFeedback = async (req, res) => {
  try {
    const { limit = 20, status, sortBy = "createdAt" } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const feedbacks = await Feedback.find(query)
      .sort({ [sortBy]: -1 })
      .limit(parseInt(limit))
      .select("-__v")
      .lean();

    // Calculate stats
    const totalFeedback = await Feedback.countDocuments();
    const implementedCount = await Feedback.countDocuments({
      status: "Implemented",
    });
    const implementationRate =
      totalFeedback > 0
        ? ((implementedCount / totalFeedback) * 100).toFixed(0) + "%"
        : "0%";

    // Calculate average rating
    const ratingResult = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const averageRating =
      ratingResult.length > 0 ? ratingResult[0].avgRating.toFixed(1) : 0;

    res.status(200).json({
      success: true,
      feedbacks,
      stats: {
        totalFeedback,
        averageRating: parseFloat(averageRating),
        implementationRate,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
      error: error.message,
    });
  }
};

// Upvote feedback
export const upvoteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // Check if user already upvoted
    const hasUpvoted = feedback.upvotedBy.includes(userId);

    if (hasUpvoted) {
      // Remove upvote
      feedback.upvotedBy = feedback.upvotedBy.filter(
        (id) => id.toString() !== userId
      );
      feedback.upvotes = Math.max(0, feedback.upvotes - 1);
    } else {
      // Add upvote
      feedback.upvotedBy.push(userId);
      feedback.upvotes += 1;
    }

    await feedback.save();

    res.status(200).json({
      success: true,
      message: hasUpvoted ? "Upvote removed" : "Upvoted successfully",
      feedback: {
        _id: feedback._id,
        upvotes: feedback.upvotes,
        hasUpvoted: !hasUpvoted,
      },
    });
  } catch (error) {
    console.error("Error upvoting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upvote feedback",
      error: error.message,
    });
  }
};

// Update feedback status (Admin only)
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { status } = req.body;

    if (!["New", "Reviewing", "Implemented", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { status },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback status updated",
      feedback,
    });
  } catch (error) {
    console.error("Error updating feedback status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update feedback status",
      error: error.message,
    });
  }
};
