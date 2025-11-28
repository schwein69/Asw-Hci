const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const travelcardRouter = require("./routes/travelcardRouter");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

app.use("/", travelcardRouter);
mongoose
  .connect(MONGO_URI)
  .then(() =>
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    )
  )
  .catch((err) => console.error("DB connection error:", err));
