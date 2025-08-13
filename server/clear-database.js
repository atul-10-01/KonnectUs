// Quick script to clear all collections
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to database");
    
    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log(`Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    console.log("\n🗑️ Clearing all collections...");
    
    // Clear each collection
    for (const collection of collections) {
      const result = await mongoose.connection.db.collection(collection.name).deleteMany({});
      console.log(`✅ Cleared ${collection.name}: ${result.deletedCount} documents deleted`);
    }
    
    console.log("\n🎉 Database cleared successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

clearDatabase();
