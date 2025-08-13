// Script to clear database and create fresh test data
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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

// Schemas
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

const friendRequestSchema = new mongoose.Schema({
  requestTo: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  requestFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  requestStatus: { type: String, default: "Pending" },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  description: { type: String, required: true },
  image: { type: String },
  likes: [{ type: String }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comments" }],
}, { timestamps: true });

const Users = mongoose.model("Users", userSchema);
const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
const Posts = mongoose.model("Posts", postSchema);

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const setupFreshDatabase = async () => {
  try {
    await dbConnect();
    
    console.log("🗑️  CLEARING EXISTING DATA...\n");
    
    // Clear all collections
    await Users.deleteMany({});
    await FriendRequest.deleteMany({});
    await Posts.deleteMany({});
    console.log("✅ All collections cleared");
    
    console.log("\n👥 CREATING FRESH TEST USERS...\n");
    
    // Create test users
    const hashedPassword = await hashPassword("password123");
    
    const users = [
      {
        firstName: "John",
        lastName: "Doe", 
        email: "john@test.com",
        password: hashedPassword,
        location: "New York, USA",
        profession: "Software Developer",
        verified: true,
        profileUrl: "https://res.cloudinary.com/djs3wu5bg/image/upload/v1683874458/samples/people/jazz.jpg"
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@test.com", 
        password: hashedPassword,
        location: "Los Angeles, USA",
        profession: "UX Designer",
        verified: true,
        profileUrl: "https://res.cloudinary.com/djs3wu5bg/image/upload/v1683874458/samples/people/kitchen-bar.jpg"
      },
      {
        firstName: "Mike",
        lastName: "Johnson",
        email: "mike@test.com",
        password: hashedPassword,
        location: "Chicago, USA", 
        profession: "Product Manager",
        verified: true,
        profileUrl: "https://res.cloudinary.com/djs3wu5bg/image/upload/v1683874458/samples/people/boy-snow-hoodie.jpg"
      },
      {
        firstName: "Sarah",
        lastName: "Wilson",
        email: "sarah@test.com",
        password: hashedPassword,
        location: "Austin, USA",
        profession: "Data Scientist", 
        verified: true,
        profileUrl: "https://res.cloudinary.com/djs3wu5bg/image/upload/v1683874458/samples/people/smiling-man.jpg"
      }
    ];
    
    const createdUsers = await Users.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} test users:`);
    createdUsers.forEach(user => {
      console.log(`   📧 ${user.email} (ID: ${user._id})`);
    });
    
    console.log("\n🤝 SETTING UP FRIEND RELATIONSHIPS...\n");
    
    // Make John and Jane friends (accepted)
    const johnId = createdUsers[0]._id;
    const janeId = createdUsers[1]._id; 
    const mikeId = createdUsers[2]._id;
    const sarahId = createdUsers[3]._id;
    
    // Add friendship between John and Jane
    await Users.findByIdAndUpdate(johnId, { $push: { friends: janeId } });
    await Users.findByIdAndUpdate(janeId, { $push: { friends: johnId } });
    
    // Create accepted friend request record
    await FriendRequest.create({
      requestFrom: johnId,
      requestTo: janeId,
      requestStatus: "Accepted"
    });
    
    // Create pending requests
    await FriendRequest.create({
      requestFrom: mikeId,
      requestTo: johnId,
      requestStatus: "Pending"
    });
    
    await FriendRequest.create({
      requestFrom: sarahId,
      requestTo: johnId, 
      requestStatus: "Pending"
    });
    
    console.log("✅ John ↔ Jane: Friends (Accepted)");
    console.log("✅ Mike → John: Pending request");
    console.log("✅ Sarah → John: Pending request");
    
    console.log("\n📝 CREATING SAMPLE POSTS...\n");
    
    // Create sample posts
    const posts = [
      {
        userId: johnId,
        description: "Just finished an amazing React project! 🚀 #coding #react",
        image: "https://res.cloudinary.com/djs3wu5bg/image/upload/v1683874458/samples/landscapes/beach-boat.jpg"
      },
      {
        userId: janeId,
        description: "Beautiful sunset from my office window 🌅 #worklife #sunset",
        image: "https://res.cloudinary.com/djs3wu5bg/image/upload/v1683874458/samples/landscapes/girl-urban-view.jpg"
      },
      {
        userId: mikeId,
        description: "Great team meeting today! Excited about our new product launch 🎉"
      },
      {
        userId: sarahId,
        description: "Data visualization can be so beautiful when done right 📊✨",
        image: "https://res.cloudinary.com/djs3wu5bg/image/upload/v1683874458/samples/food/spices.jpg"
      }
    ];
    
    const createdPosts = await Posts.insertMany(posts);
    console.log(`✅ Created ${createdPosts.length} sample posts`);
    
    console.log("\n🎯 FRESH DATABASE SETUP COMPLETE!\n");
    console.log("📋 TEST ACCOUNTS:");
    console.log("   👨 john@test.com / password123 (Has 1 friend, 2 pending requests)");
    console.log("   👩 jane@test.com / password123 (Has 1 friend)");
    console.log("   👨 mike@test.com / password123 (Sent request to John)");
    console.log("   👩 sarah@test.com / password123 (Sent request to John)");
    console.log("\n🧪 RECOMMENDED TESTING:");
    console.log("   1. Login as John - see 2 pending friend requests");
    console.log("   2. Accept/deny requests to test functionality");
    console.log("   3. Login as other users to test different perspectives");
    console.log("   4. Send new friend requests between users");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

setupFreshDatabase();
