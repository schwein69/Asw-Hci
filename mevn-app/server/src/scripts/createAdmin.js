import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/users.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function createAdmin() {
  try {
    if (!ADMIN_EMAIL || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
      console.error("Error: ADMIN_EMAIL, ADMIN_USERNAME, and ADMIN_PASSWORD must be set in .env file");
      process.exit(1);
    }

    if (!MONGO_URI) {
      console.error("Error: MONGO_URI must be set in .env file");
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const existingAdmin = await User.findOne({
      $or: [
        { email: ADMIN_EMAIL },
        { username: ADMIN_USERNAME }
      ]
    });

    if (existingAdmin) {
      console.log("User already exists with this email or username");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

    const newAdmin = new User({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "AdminGeneral"
    });

    await newAdmin.save();

    console.log("User created successfully!");
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Username: ${ADMIN_USERNAME}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();

