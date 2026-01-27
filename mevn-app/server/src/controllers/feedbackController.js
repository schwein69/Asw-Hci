import Feedback from "../models/feedback.js";
import User from "../models/users.js";
import Notification from "../models/notification.js";
import { emitNotification } from "../socket/notificationSocket.js";

// Create new feedback
export const createFeedback = async (req, res) => {
  try {
    const { userId, category, subject, message, rating } = req.body;

    console.log("📝 Feedback submission:", {
      userId,
      category,
      subject,
      message,
      rating,
    });

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

    // Handle Report User - increment numberOfReports for the reported user
    if (category === "feedback.reportUser") {
      // Extract reported user ID from message
      const reportedUserIdMatch = message.match(/User ID: ([a-f0-9]{24})/);
      if (reportedUserIdMatch && reportedUserIdMatch[1]) {
        const reportedUserId = reportedUserIdMatch[1];
        console.log(`🚨 Reporting user: ${reportedUserId}`);
        await User.findByIdAndUpdate(reportedUserId, {
          $inc: { numberOfReports: 1 },
        });
        console.log(`✅ Incremented reports for user ${reportedUserId}`);
      }
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
    console.error("❌ Error creating feedback:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
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

    const query = {
      category: { $ne: "feedback.reportUser" },
    };
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

      // Create notification for feedback author (only when upvoting, not removing)
      if (feedback.user.toString() !== userId) {
        // Don't notify if user upvotes their own feedback
        const notification = new Notification({
          recipient: feedback.user,
          type: "social",
          message: `Someone liked your feedback: "${feedback.subject}"`,
          icon: "Bell",
        });

        await notification.save();

        // Push notification via Socket.io
        const io = req.app.get("io");
        if (io) {
          emitNotification(io, feedback.user.toString(), notification);
        }

        console.log(
          `Upvote notification sent to user ${feedback.user} for feedback: ${feedback.subject}`
        );
      }
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

export const getReportedUserFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      category: "feedback.reportUser",
    })
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    const mapped = feedbacks.map((feedback) => {
      const reportedUserIdMatch = feedback.message?.match(
        /User ID: ([a-f0-9]{24})/
      );
      const reportedUserId =
        reportedUserIdMatch && reportedUserIdMatch[1]
          ? reportedUserIdMatch[1]
          : null;

      const reportedUserNameMatch = feedback.subject?.match(/Report User:\s*(.+)$/);
      const reportedUserName =
        reportedUserNameMatch && reportedUserNameMatch[1]
          ? reportedUserNameMatch[1]
          : null;

      return {
        ...feedback,
        reportedUserId,
        reportedUserName,
      };
    });

    res.status(200).json({
      success: true,
      feedbacks: mapped,
    });
  } catch (error) {
    console.error("Error fetching reported user feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reported user feedback",
      error: error.message,
    });
  }
};