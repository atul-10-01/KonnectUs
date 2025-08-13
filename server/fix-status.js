// Script to fix friend request status inconsistencies
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// MongoDB connection
const dbConnect = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB Connected Successfully");
    return connection;
  } catch (error) {
    console.log("DB Error: " + error);
  }
};

// Friend Request Schema
const friendRequestSchema = new mongoose.Schema({
  requestTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  requestFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  requestStatus: {
    type: String,
    default: "Pending",
  },
});

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

const fixStatuses = async () => {
  try {
    await dbConnect();
    
    // Fix lowercase 'accepted' to 'Accepted'
    const result1 = await FriendRequest.updateMany(
      { requestStatus: "accepted" },
      { requestStatus: "Accepted" }
    );
    console.log(`Fixed ${result1.modifiedCount} 'accepted' statuses to 'Accepted'`);
    
    // Fix lowercase 'pending' to 'Pending'
    const result2 = await FriendRequest.updateMany(
      { requestStatus: "pending" },
      { requestStatus: "Pending" }
    );
    console.log(`Fixed ${result2.modifiedCount} 'pending' statuses to 'Pending'`);
    
    // Fix lowercase 'denied' to 'Denied'
    const result3 = await FriendRequest.updateMany(
      { requestStatus: "denied" },
      { requestStatus: "Denied" }
    );
    console.log(`Fixed ${result3.modifiedCount} 'denied' statuses to 'Denied'`);
    
    // Show all current statuses
    const allRequests = await FriendRequest.find({}).select('requestStatus');
    const statusCount = allRequests.reduce((acc, req) => {
      acc[req.requestStatus] = (acc[req.requestStatus] || 0) + 1;
      return acc;
    }, {});
    
    console.log("Current status counts:", statusCount);
    
    process.exit(0);
  } catch (error) {
    console.error("Error fixing statuses:", error);
    process.exit(1);
  }
};

fixStatuses();
