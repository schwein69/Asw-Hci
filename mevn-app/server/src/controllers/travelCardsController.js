import TravelCard from "../models/travelCard.js";
import Notification from "../models/notification.js";
import { emitNotification } from "../socket/notificationSocket.js";
import { getCoordinatesFromAddress } from "../services/mapBox.js";

// Add new travel card
export const createTravelCard = async (req, res) => {
  try {
    const data = req.body;
    if (!data.creator) {
      console.error("Missing Creator ID");
      return res
        .status(400)
        .json({ message: "User ID (creator) is missing. Are you logged in?" });
    }
    let coordinates = { longitude: 0, latitude: 0 }; // Default Fallback
    try {
      if (data.address) {
        const geoResult = await getCoordinatesFromAddress(data.address);
        if (geoResult && typeof geoResult.latitude === "number") {
          coordinates = geoResult;
        }
      }
    } catch (geoError) {
      console.warn("Geocoding failed, using default (0,0):", geoError.message);
    }
    const newCard = new TravelCard({
      creator: data.creator,
      title: data.title,
      description: data.description,
      images: data.image || [],
      category: data.category,
      price: data.price,
      location: {
        type: "Point",
        coordinates: [coordinates.longitude, coordinates.latitude], // Order: [Longitude, Latitude]
        address: data.address,
      },
      status: "Pending",
    });

    const savedCard = await newCard.save();
    res.status(201).json(savedCard);
  } catch (error) {
    res.status(500).json({ message: `Error creating card: ${error.message}` });
  }
};

// Get ALL travel cards with Search & Category
export const getTravelCards = async (req, res) => {
  try {
    const userId = req.query.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit; // Calculate items to skip
    // Extract new query params
    const { search, category } = req.query;

    // Build the Filter Object
    const matchStage = {
      status: "Approved",
    };

    // Exclude current user's posts
    /*if (userId) {
      matchStage.creator = { $ne: new mongoose.Types.ObjectId(userId) };
    }*/

    // Filter by Category (if provided and not "All")
    if (category && category !== "All") {
      matchStage.category = category;
    }

    // Filter by Search
    if (search) {
      // $regex allows partial matching, $options: "i" makes it case-insensitive
      matchStage.title = { $regex: search, $options: "i" };
    }

    //  Aggregation
    let cards = await TravelCard.find(matchStage)
      .sort({ createdAt: -1 })
      .skip(skip) // Apply pagination skipping
      .limit(limit) // Apply limit
      .populate("creator", "_id username profileImage") // Populate user
      .lean();

    // If a user is logged in, calculate if they have liked/saved these cards
    if (userId) {
      cards = cards.map((card) => {
        const likesStrings = (card.likes || []).map((id) => id.toString());
        const savesStrings = (card.saves || []).map((id) => id.toString());
        return {
          ...card,
          isLiked: likesStrings.includes(userId.toString()),
          isSaved: savesStrings.includes(userId.toString()),
        };
      });
    }

    // Pagination Counts
    const total = await TravelCard.countDocuments(matchStage);

    res.status(200).json({
      cards,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + cards.length < total,
    });
    console.log(`Fetched ${cards.length} cards for page ${page}`);
  } catch (error) {
    res.status(500).json({ message: `Error fetching cards: ${error.message}` });
  }
};

// Get only the current user's travel cards (With Search & Category)
export const getUserTravelCards = async (req, res) => {
  try {
    const userId = req.query.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const { search, category } = req.query; // Extract params

    const skip = (page - 1) * limit;

    // Build Base Query
    const query = { creator: userId };

    // Category Filter
    if (category && category !== "all" && category !== "All") {
      query.category = category;
    }

    // Search Filter (Title)
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Fetch cards created by this user
    let cards = await TravelCard.find(query)
      .populate("creator", "username profileImage")
      .sort({ createdAt: -1 }) // Newest to Oldest
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await TravelCard.countDocuments(query);
    if (userId) {
      cards = cards.map((card) => {
        const likesStrings = (card.likes || []).map((id) => id.toString());
        const savesStrings = (card.saves || []).map((id) => id.toString());

        return {
          ...card,
          // Check if the viewer's ID is in the likes/saves arrays
          isLiked: likesStrings.includes(userId.toString()),
          isSaved: savesStrings.includes(userId.toString()),
        };
      });
    }
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

// Get cards that the user has Saved (With Search & Category)
export const getSavedTravelCards = async (req, res) => {
  try {
    const userId = req.query.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const { search, category } = req.query; // Extract params

    const skip = (page - 1) * limit;

    // Build Base Query (Saved + Approved)
    const query = {
      saves: userId,
      status: "Approved",
    };

    // Add Category Filter
    if (category && category !== "all" && category !== "All") {
      query.category = category;
    }

    // Add Search Filter (Title)
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    let cards = await TravelCard.find(query)
      .populate("creator", "username profileImage")
      .sort({ createdAt: -1 }) // Sorted by Card creation date
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await TravelCard.countDocuments(query);
    // If a user is logged in, calculate if they have liked/saved these cards
    if (userId) {
      cards = cards.map((card) => {
        const likesStrings = (card.likes || []).map((id) => id.toString());
        const savesStrings = (card.saves || []).map((id) => id.toString());

        return {
          ...card,
          isLiked: likesStrings.includes(userId.toString()),
          isSaved: savesStrings.includes(userId.toString()),
        };
      });
    }
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
    if (updateData.image) card.images = updateData.image;

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
    const userId = req.body.userId;

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
    const userId = req.body.userId;

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
// Toggle save/unsave travel card
export const toggleSaveCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.body.userId;

    const card = await TravelCard.findById(cardId);
    if (!card) return res.status(404).json({ message: "Card not found" });

    const isSaved = card.saves.includes(userId);

    if (isSaved) {
      // --- UNSAVE ---
      await TravelCard.findByIdAndUpdate(
        cardId,
        { $pull: { saves: userId } }, // Remove user ID from saves array
        { new: true },
      );

      return res.status(200).json({
        message: "Removed from saves",
        isSaved: false,
      });
    } else {
      // --- SAVE ---
      await TravelCard.findByIdAndUpdate(
        cardId,
        { $addToSet: { saves: userId } }, // Add user ID
        { new: true },
      );

      return res.status(200).json({
        message: "Card saved",
        isSaved: true,
      });
    }
  } catch (error) {
    res.status(500).json({ message: `Error toggling save: ${error.message}` });
  }
};
// Report a travel card
export const reportTravelCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.body.userId;

    // Find the card
    const card = await TravelCard.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    // Prevent Duplicate Reporting
    const alreadyReported = card.reports.some(
      (r) => r.user.toString() === userId,
    );

    if (alreadyReported) {
      return res
        .status(409)
        .json({ message: "You have already reported this card" });
    }

    // Add Report & Increment Counter
    card.reports.push({
      user: userId,
    });

    // Increment your new counter
    card.numberOfReports += 1;

    //  If 2 people report it, mark it suspicious automatically
    const REPORT_THRESHOLD = 2;

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

export const getModerationCards = async (req, res) => {
  try {
    const statusParam = req.query.status;
    const statuses = statusParam
      ? statusParam.split(",").map((status) => status.trim())
      : ["Pending", "Rejected", "Suspicious"];

    const cards = await TravelCard.find({ status: { $in: statuses } })
      .populate("creator", "username profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({ cards });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching moderation cards: ${error.message}` });
  }
};

export const updateTravelCardStatus = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Approved", "Rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedCard = await TravelCard.findByIdAndUpdate(
      cardId,
      { status },
      { new: true },
    ).populate("creator", "username profileImage");

    if (!updatedCard) {
      return res.status(404).json({ message: "Card not found" });
    }

    res.status(200).json(updatedCard);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error updating card status: ${error.message}` });
  }
};
