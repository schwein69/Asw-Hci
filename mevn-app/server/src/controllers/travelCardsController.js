import TravelCard from "../models/travelCard.js";
import Notification from "../models/notification.js";
import { emitNotification } from "../utils/socketUtils.js";
import { getCoordinatesFromAddress } from "../services/mapBox.js";
// Add new travel card
export const createTravelCard = async (userId, data) => {
  try {
    const newCard = new TravelCard({
      creator: userId,
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
    return savedCard;
  } catch (error) {
    throw new Error(`Error creating card: ${error.message}`);
  }
};
// Get travel cards with pagination and random selection
export const getTravelCards = async (page = 1, limit = 10) => {
  try {
    // Random Selection using aggregation Pipeline
    const cards = await TravelCard.aggregate([
      { $match: { status: "Approved" } },
      { $sample: { size: limit } },
    ]);

    // Populate user details
    await TravelCard.populate(cards, {
      path: "creator",
      select: "username profileImage",
    });

    // Pagination Logic (For frontend infinite scroll handling)
    const total = await TravelCard.countDocuments({ status: "Approved" });
    const skippedSoFar = (page - 1) * limit;

    return {
      cards,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: skippedSoFar + cards.length < total,
    };
  } catch (error) {
    throw new Error(`Error fetching cards: ${error.message}`);
  }
};
// Update travel card
export const updateTravelCard = async (cardId, userId, updateData) => {
  try {
    const card = await TravelCard.findOne({ _id: cardId, creator: userId });

    if (!card) {
      throw new Error("Card not found or unauthorized");
    }

    if (updateData.title) card.title = updateData.title;
    if (updateData.description) card.description = updateData.description;
    if (updateData.price) card.price = updateData.price;
    if (updateData.category) card.category = updateData.category;
    if (updateData.images) card.images = updateData.images;

    //  User changed the address
    updateData.address && updateData.address !== card.location.address;
    console.log("Address changed, fetching new coordinates...");
    const [lng, lat] = await getCoordinatesFromAddress(updateData.address);

    card.location = {
      type: "Point",
      coordinates: [lng, lat],
      address: updateData.address,
    };

    const updatedCard = await card.save();
    return updatedCard;
  } catch (error) {
    throw new Error(`Error updating card: ${error.message}`);
  }
};
// Delete travel card
export const deleteTravelCard = async (cardId, userId) => {
  try {
    const deletedCard = await TravelCard.findOneAndDelete({
      _id: cardId,
      creator: userId,
    });

    if (!deletedCard) {
      throw new Error("Card not found or unauthorized");
    }

    return { message: "Card deleted successfully" };
  } catch (error) {
    throw new Error(`Error deleting card: ${error.message}`);
  }
};
// Toggle like/unlike travel card with socket io notification
export const toggleLikeCard = async (cardId, userId) => {
  try {
    const card = await TravelCard.findById(cardId);
    if (!card) throw new Error("Card not found");

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

      return {
        message: "Unliked",
        active: false,
        likesCount: updatedCard.numberOfLikes,
      };
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

      return {
        message: "Liked",
        active: true,
        likesCount: updatedCard.numberOfLikes,
      };
    }
  } catch (error) {
    throw new Error(`Error toggling like: ${error.message}`);
  }
};
