// Script to fix missing friendships from accepted requests
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("DB Connected Successfully");
  } catch (error) {
    console.log("DB Error: " + error);
  }
};

const friendRequestSchema = new mongoose.Schema({
  requestTo: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  requestFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  requestStatus: { type: String, default: "Pending" },
});

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: true },
  location: { type: String },
  profileUrl: { type: String },
  profession: { type: String },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
  views: [{ type: String }],
  verified: { type: Boolean, default: false },
}, { timestamps: true });

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
const Users = mongoose.model("Users", userSchema);

const fixMissingFriendships = async () => {
  try {
    await dbConnect();
    
    console.log("=== FIXING MISSING FRIENDSHIPS ===\n");
    
    // Get all accepted friend requests
    const acceptedRequests = await FriendRequest.find({ 
      requestStatus: "Accepted" 
    });
    
    console.log(`Found ${acceptedRequests.length} accepted requests`);
    
    for (const request of acceptedRequests) {
      const { requestFrom, requestTo } = request;
      
      console.log(`\nProcessing friendship: ${requestFrom} <-> ${requestTo}`);
      
      // Check if friendship exists in both directions
      const user1 = await Users.findById(requestTo).select('friends firstName lastName');
      const user2 = await Users.findById(requestFrom).select('friends firstName lastName');
      
      if (!user1 || !user2) {
        console.log("  ❌ One or both users not found");
        continue;
      }
      
      console.log(`  User1 (${user1.firstName} ${user1.lastName}): ${user1.friends.length} friends`);
      console.log(`  User2 (${user2.firstName} ${user2.lastName}): ${user2.friends.length} friends`);
      
      const user1HasUser2 = user1.friends.some(f => f.toString() === requestFrom.toString());
      const user2HasUser1 = user2.friends.some(f => f.toString() === requestTo.toString());
      
      console.log(`  User1 has User2 as friend: ${user1HasUser2}`);
      console.log(`  User2 has User1 as friend: ${user2HasUser1}`);
      
      let updated = false;
      
      // Add missing friendships
      if (!user1HasUser2) {
        await Users.findByIdAndUpdate(requestTo, { 
          $addToSet: { friends: requestFrom } 
        });
        console.log("  ✅ Added User2 to User1's friends");
        updated = true;
      }
      
      if (!user2HasUser1) {
        await Users.findByIdAndUpdate(requestFrom, { 
          $addToSet: { friends: requestTo } 
        });
        console.log("  ✅ Added User1 to User2's friends");
        updated = true;
      }
      
      if (!updated) {
        console.log("  ✓ Friendship already exists correctly");
      }
    }
    
    // Show final friends count for main user
    const mainUser = await Users.findById("6806430f59ad75b25d0b29de").select('friends firstName lastName');
    console.log(`\n=== FINAL STATE ===`);
    console.log(`Main user (${mainUser.firstName} ${mainUser.lastName}): ${mainUser.friends.length} friends`);
    console.log("Friends:", mainUser.friends);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

fixMissingFriendships();
