// fixUserIndex.js
import mongoose from "mongoose";
import User from "./Models/User.js";

// ⚠️ Use the same connection string as in your index.js
const MONGO_URI =
  "mongodb+srv://admin:123@cluster0.yg47z6r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Drop old index if it exists
    try {
      await User.collection.dropIndex({ email: 1 });
      console.log("🗑 Dropped old { email: 1 } index");
    } catch (err) {
      console.log("ℹ️ dropIndex skipped:", err.message);
    }

    // Create sparse unique index
    await User.collection.createIndex(
      { email: 1 },
      { unique: true, sparse: true }
    );

    console.log("✅ Sparse unique email index created successfully");
  } catch (err) {
    console.error("❌ Error fixing index:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
