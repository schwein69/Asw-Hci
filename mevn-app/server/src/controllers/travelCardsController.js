import TravelCard from "../models/travelCard.js";
import Notification from "../models/notification.js";
import { emitNotification } from "../socket/notificationSocket.js";
import { getCoordinatesFromAddress } from "../services/mapBox.js";
import mongoose from "mongoose";

// Add new travel card
export const createTravelCard = async (req, res) => {
  try {
    const data = req.body;
    const newCard = new TravelCard({
      creator: data.creator,
      title: data.title,
      description: data.description,
      images: data.images || [],
      category: data.category,
      price: data.price,
      location: {
        type: "Point",
        coordinates: [data.longitude, data.latitude], // Order: [Longitude, Latitude]
        address: data.address,
      },
    });

    const savedCard = await newCard.save();
    res.status(201).json(savedCard);
  } catch (error) {
    res.status(500).json({ message: `Error creating card: ${error.message}` });
  }
};

// Get ALL travel cards (Randomized Feed) excluding the current user's posts
export const getTravelCards = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;

    // Approved status AND not created by current user
    const matchStage = {
      status: "Approved",
    };

    // Exclude user's posts
    if (userId) {
      matchStage.creator = { $ne: new mongoose.Types.ObjectId(userId) };
    }

    // Random Selection using aggregation Pipeline
    const cards = await TravelCard.aggregate([
      { $match: matchStage },
      { $sample: { size: limit } },
    ]);

    // Populate user details
    await TravelCard.populate(cards, {
      path: "creator",
      select: "_id username profileImage",
    });

    // Pagination Logic
    const total = await TravelCard.countDocuments(matchStage);
    const skippedSoFar = (page - 1) * limit;

    res.status(200).json({
      cards,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: skippedSoFar + cards.length < total,
    });
  } catch (error) {
    res.status(500).json({ message: `Error fetching cards: ${error.message}` });
  }
};

// Get only the current user's travel cards
export const getUserTravelCards = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const query = { creator: userId };
    // Fetch cards created by this user
    const cards = await TravelCard.find(query)
      .populate("creator", "username profileImage")
      .sort({ createdAt: -1 }) // Newest to Oldest
      .skip(skip)
      .limit(limit);

    const total = await TravelCard.countDocuments(query);

    res.status(200).json({
      cards,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + cards.length < total,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching user cards: ${error.message}` });
  }
};

// Get cards that the user has Saved
export const getSavedTravelCards = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find cards where the 'likes' array contains the userId
    const query = {
      likes: userId,
      status: "Approved",
    };

    const cards = await TravelCard.find(query)
      .populate("creator", "username profileImage")
      .sort({ createdAt: -1 }) // Sorted by Card creation date
      .skip(skip)
      .limit(limit);

    const total = await TravelCard.countDocuments(query);

    res.status(200).json({
      cards,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + cards.length < total,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching liked cards: ${error.message}` });
  }
};

// Update travel card
export const updateTravelCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.userId;
    const updateData = req.body;

    const card = await TravelCard.findOne({ _id: cardId, creator: userId });

    if (!card) {
      return res
        .status(404)
        .json({ message: "Card not found or unauthorized" });
    }

    if (updateData.title) card.title = updateData.title;
    if (updateData.description) card.description = updateData.description;
    if (updateData.price) card.price = updateData.price;
    if (updateData.category) card.category = updateData.category;
    if (updateData.images) card.images = updateData.images;

    //  User changed the address
    if (updateData.address && updateData.address !== card.location.address) {
      console.log("Address changed, fetching new coordinates...");
      const [lng, lat] = await getCoordinatesFromAddress(updateData.address);

      card.location = {
        type: "Point",
        coordinates: [lng, lat],
        address: updateData.address,
      };
    }

    const updatedCard = await card.save();
    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: `Error updating card: ${error.message}` });
  }
};

// Delete travel card
export const deleteTravelCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.userId;

    const deletedCard = await TravelCard.findOneAndDelete({
      _id: cardId,
      creator: userId,
    });

    if (!deletedCard) {
      return res
        .status(404)
        .json({ message: "Card not found or unauthorized" });
    }

    res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: `Error deleting card: ${error.message}` });
  }
};

// Toggle like/unlike travel card with socket io notification
export const toggleLikeCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.userId;

    const card = await TravelCard.findById(cardId);
    if (!card) return res.status(404).json({ message: "Card not found" });

    const isLiked = card.likes.includes(userId);
    const creatorId = card.creator.toString();
    const likerId = userId.toString();

    if (isLiked) {
      // --- UNLIKE ---
      const updatedCard = await TravelCard.findByIdAndUpdate(
        cardId,
        {
          $pull: { likes: userId },
          $inc: { numberOfLikes: -1 },
        },
        { new: true },
      );

      return res.status(200).json({
        message: "Unliked",
        active: false,
        likesCount: updatedCard.numberOfLikes,
      });
    } else {
      // --- LIKE ---
      const updatedCard = await TravelCard.findByIdAndUpdate(
        cardId,
        {
          $addToSet: { likes: userId },
          $inc: { numberOfLikes: 1 },
        },
        { new: true },
      );

      // --- NOTIFICA (Database + Socket) ---
      const io = req.app.get("io");
      // Verifico che io esista e che l'utente non stia mettendo like a se stesso
      if (io && creatorId !== likerId) {
        const notification = new Notification({
          recipient: creatorId, // Il creatore della card
          sender: likerId, // Chi ha messo il like
          type: "social",
          message: `Someone liked your travel card: "${card.title}"`, // Usa il titolo della card
          icon: "Heart",
        });

        await notification.save();

        if (io) {
          emitNotification(io, creatorId, notification);
        }
      }

      return res.status(200).json({
        message: "Liked",
        active: true,
        likesCount: updatedCard.numberOfLikes,
      });
    }
  } catch (error) {
    res.status(500).json({ message: `Error toggling like: ${error.message}` });
  }
};
// Report a travel card
export const reportTravelCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.userId; // reporter's ID
    const { reason } = req.body;

    // Find the card
    const card = await TravelCard.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    // 2. Prevent Duplicate Reporting
    const alreadyReported = card.reports.some(
      (r) => r.user.toString() === userId,
    );

    if (alreadyReported) {
      return res
        .status(400)
        .json({ message: "You have already reported this card" });
    }

    // Add Report & Increment Counter
    card.reports.push({
      user: userId,
      reason: reason || "No reason provided",
    });

    // Increment your new counter
    card.numberOfReports += 1;

    //  If 5 people report it, mark it suspicious automatically
    const REPORT_THRESHOLD = 5;

    if (card.numberOfReports >= REPORT_THRESHOLD) {
      card.status = "Suspicious";
    }

    await card.save();

    res.status(200).json({
      message: "Report submitted.",
      currentReports: card.numberOfReports,
    });
  } catch (error) {
    res.status(500).json({ message: `Error reporting card: ${error.message}` });
  }
};
