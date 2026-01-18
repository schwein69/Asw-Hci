import mongoose from "mongoose";
import dotenv from "dotenv";
import Notification from "../models/notification.js";
import User from "../models/users.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const sampleNotifications = [
  {
    type: "weather",
    city: "Berlin",
    message: "Weather conditions updated",
    icon: "Cloud",
    weatherData: {
      condition: "Rainy",
      temperature: 8,
      weatherCode: 61,
      alert: true,
    },
  },
  {
    type: "social",
    city: "Berlin",
    message: "New interaction on your post",
    icon: "Bell",
  },
  {
    type: "weather",
    city: "Amsterdam",
    message: "Weather conditions updated",
    icon: "Cloud",
    weatherData: {
      condition: "Foggy",
      temperature: 5,
      weatherCode: 45,
      alert: true,
    },
  },
  {
    type: "social",
    city: "Berlin",
    message: "New interaction on your post",
    icon: "Bell",
  },
  {
    type: "weather",
    city: "Amsterdam",
    message: "Weather conditions updated",
    icon: "Cloud",
    weatherData: {
      condition: "Partly Cloudy",
      temperature: 7,
      weatherCode: 2,
      alert: false,
    },
  },
  {
    type: "weather",
    city: "Barcelona",
    message: "Weather conditions updated",
    icon: "Cloud",
    weatherData: {
      condition: "Sunny",
      temperature: 15,
      weatherCode: 0,
      alert: false,
    },
  },
  {
    type: "location",
    city: "Copenhagen",
    message: "New eco-friendly location recommended",
    icon: "MapPin",
  },
  {
    type: "tourist",
    city: "Copenhagen",
    message: "Tourist density changed",
    icon: "User",
  },
  {
    type: "location",
    city: "Copenhagen",
    message: "New eco-friendly location recommended",
    icon: "MapPin",
  },
  {
    type: "weather",
    city: "Barcelona",
    message: "Weather alert in Barcelona: Stormy",
    icon: "Cloud",
    weatherData: {
      condition: "Stormy",
      temperature: 12,
      weatherCode: 95,
      alert: true,
    },
  },
  {
    type: "tourist",
    city: "Amsterdam",
    message:
      "High tourist density detected - Consider visiting during off-peak hours",
    icon: "User",
  },
  {
    type: "location",
    city: "Berlin",
    message: "Sustainable restaurant nearby: GreenBite Café",
    icon: "MapPin",
  },
  {
    type: "transport",
    city: "Copenhagen",
    message: "Train TG9452 departure reminder - Platform 7",
    icon: "TrainFront",
  },
  {
    type: "weather",
    city: "Copenhagen",
    message: "Weather alert in Copenhagen: Snowy",
    icon: "Cloud",
    weatherData: {
      condition: "Snowy",
      temperature: -2,
      weatherCode: 75,
      alert: true,
    },
  },
  {
    type: "social",
    city: "Barcelona",
    message: "Someone liked your travel card",
    icon: "Bell",
  },
];

async function seedNotifications() {
  try {
    console.log("🌱 Starting notification seeding...");

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find first user or create a test user
    let user = await User.findOne();

    if (!user) {
      console.log("⚠️  No users found! Creating test user...");
      const bcrypt = await import("bcrypt");
      const hashedPassword = await bcrypt.hash("test123", 10);

      user = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
        role: "Standard",
      });
      console.log(`✅ Test user created: ${user.email}`);
    }

    console.log(`📧 Using user: ${user.email} (ID: ${user._id})`);

    // Clear existing notifications for this user
    const deleted = await Notification.deleteMany({ recipient: user._id });
    console.log(`🗑️  Deleted ${deleted.deletedCount} old notifications`);

    // Create notifications with timestamps spread over last 6 hours
    const now = Date.now();
    const notifications = sampleNotifications.map((notif, index) => ({
      recipient: user._id,
      ...notif,
      createdAt: new Date(now - index * 15 * 60 * 1000), // 15 min intervals
    }));

    const inserted = await Notification.insertMany(notifications);
    console.log(`✅ Inserted ${inserted.length} notifications`);

    console.log("\n📊 Summary:");
    console.log(`   - User: ${user.username} (${user.email})`);
    console.log(`   - User ID: ${user._id}`);
    console.log(`   - Notifications: ${inserted.length}`);
    console.log("\n🎉 Seeding complete! You can now test the Live page.");
    console.log(`💡 Log in with: ${user.email} / test123 (if using test user)`);
  } catch (error) {
    console.error("❌ Error seeding notifications:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

seedNotifications();
