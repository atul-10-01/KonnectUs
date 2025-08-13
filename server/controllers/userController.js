import mongoose from "mongoose";
import Verification from "../models/emailVerification.js";
import Users from "../models/userModel.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import PasswordReset from "../models/PasswordReset.js";
import { resetPasswordLink } from "../utils/sendEmail.js";
import FriendRequest from "../models/friendRequest.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

export const verifyEmail = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const result = await Verification.findOne({ userId });

    if (result) {
      const { expiresAt, token: hashedToken } = result;

      // token has expires
      if (expiresAt < Date.now()) {
        Verification.findOneAndDelete({ userId })
          .then(() => {
            Users.findOneAndDelete({ _id: userId })
              .then(() => {
                const message = "Verification token has expired.";
                res.redirect(
                  `${CLIENT_URL}/verify-email?status=error&message=${encodeURIComponent(
                    message
                  )}`
                );
              })
              .catch(() => {
                res.redirect(`${CLIENT_URL}/verify-email?status=error&message=`);
              });
          })
          .catch((error) => {
            console.log(error);
            res.redirect(`${CLIENT_URL}/verify-email?status=error&message=`);
          });
      } else {
        //token valid
        compareString(token, hashedToken)
          .then((isMatch) => {
            if (isMatch) {
              Users.findOneAndUpdate({ _id: userId }, { verified: true })
                .then(() => {
                  Verification.findOneAndDelete({ userId }).then(() => {
                    const message = "Email verified successfully";
                    res.redirect(
                      `${CLIENT_URL}/verify-email?status=success&message=${encodeURIComponent(
                        message
                      )}`
                    );
                  });
                })
                .catch((err) => {
                  console.log(err);
                  const message = "Verification failed or link is invalid";
                  res.redirect(
                    `${CLIENT_URL}/verify-email?status=error&message=${encodeURIComponent(
                      message
                    )}`
                  );
                });
            } else {
              // invalid token
              const message = "Verification failed or link is invalid";
              res.redirect(
                `${CLIENT_URL}/verify-email?status=error&message=${encodeURIComponent(
                  message
                )}`
              );
            }
          })
          .catch((err) => {
            console.log(err);
            res.redirect(`${CLIENT_URL}/verify-email?status=error&message=`);
          });
      }
    } else {
      const message = "Invalid verification link. Try again later.";
      res.redirect(
        `${CLIENT_URL}/verify-email?status=error&message=${encodeURIComponent(
          message
        )}`
      );
    }
  } catch (error) {
    console.log(error);
    res.redirect(`${CLIENT_URL}/verify-email?status=error&message=`);
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "FAILED",
        message: "Email address not found.",
      });
    }

    const existingRequest = await PasswordReset.findOne({ email });
    if (existingRequest) {
      if (existingRequest.expiresAt > Date.now()) {
        return res.status(201).json({
          status: "PENDING",
          message: "Reset password link has already been sent to your email.",
        });
      }
      await PasswordReset.findOneAndDelete({ email });
    }
    await resetPasswordLink(user, res);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const record = await PasswordReset.findOne({ userId });
    if (!record) {
      const message = "Invalid password reset link. Try again";
      return res.redirect(
        `${CLIENT_URL}/new-password?status=error&message=${encodeURIComponent(
          message
        )}`
      );
    }

    const { expiresAt, token: resetToken } = record;

    if (expiresAt < Date.now()) {
      const message = "Reset Password link has expired. Please try again";
      return res.redirect(
        `${CLIENT_URL}/new-password?status=error&message=${encodeURIComponent(
          message
        )}`
      );
    }

    const isMatch = await compareString(token, resetToken);
    if (!isMatch) {
      const message = "Invalid reset password link. Please try again";
      return res.redirect(
        `${CLIENT_URL}/new-password?status=error&message=${encodeURIComponent(
          message
        )}`
      );
    }

    // Valid token -> redirect frontend to set new password with uid and token in query
    return res.redirect(
      `${CLIENT_URL}/new-password?uid=${encodeURIComponent(
        userId
      )}&token=${encodeURIComponent(token)}`
    );
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: error.message });
  }
};

export const validateResetToken = async (req, res) => {
  try {
    const { uid, token } = req.query;
    if (!uid || !token)
      return res.status(400).json({ valid: false, message: "missing_params" });

    const record = await PasswordReset.findOne({ userId: uid });
    if (!record)
      return res.status(400).json({ valid: false, message: "invalid_token" });

    const isMatch = await compareString(token, record.token);
    if (!isMatch) return res.status(400).json({ valid: false, message: "invalid_token" });

    if (record.expiresAt < Date.now()) {
      await PasswordReset.findOneAndDelete({ _id: record._id });
      return res.status(400).json({ valid: false, message: "expired" });
    }

    return res.json({ valid: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ valid: false, message: "server_error" });
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { uid, token, password } = req.body;

    if (!uid || !token || !password) {
      return res.status(400).json({ message: "uid, token and password are required" });
    }

    const record = await PasswordReset.findOne({ userId: uid });
    if (!record) return res.status(400).json({ message: "Invalid or expired token" });

    const isMatch = await compareString(token, record.token);
    if (!isMatch) return res.status(400).json({ message: "Invalid or expired token" });

    if (record.expiresAt < Date.now()) {
      await PasswordReset.findOneAndDelete({ _id: record._id });
      return res.status(400).json({ message: "Token expired" });
    }

    const hashedpassword = await hashString(password);

    await Users.findByIdAndUpdate({ _id: record.userId }, { password: hashedpassword });

    await PasswordReset.findOneAndDelete({ _id: record._id });

    return res.status(200).json({ ok: true, message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.params;

    const user = await Users.findById(id ?? userId).populate({
      path: "friends",
      select: "-password",
    });

    if (!user) {
      return res.status(200).send({
        message: "User Not Found",
        success: false,
      });
    }

    user.password = undefined;

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, location, profileUrl, profession } = req.body;

    if (!(firstName || lastName || profileUrl || profession || location)) {
      next("Please provide all required fields");
      return;
    }

    const { userId } = req.body.user;

    const updateUser = {
      firstName,
      lastName,
      location,
      profileUrl,
      profession,
      _id: userId,
    };
    const user = await Users.findByIdAndUpdate(userId, updateUser, {
      new: true,
    });

    await user.populate({ path: "friends", select: "-password" });
    const token = createJWT(user?._id);

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const friendRequest = async (req, res, next) => {
  try {
    console.log("Friend request received:", {
      user: req.body.user,
      requestTo: req.body.requestTo,
      headers: req.headers.authorization ? "Auth header present" : "No auth header"
    });

    const { userId } = req.body.user;
    const { requestTo } = req.body;

    console.log("Processing friend request:", { from: userId, to: requestTo });

    // Check if already friends
    const currentUser = await Users.findById(userId);
    if (currentUser.friends && currentUser.friends.includes(requestTo)) {
      return res.status(400).json({
        success: false,
        message: "Already friends with this user."
      });
    }

    // Check if there's already a pending request in either direction
    const requestExist = await FriendRequest.findOne({
      $or: [
        { requestFrom: userId, requestTo: requestTo, requestStatus: "Pending" },
        { requestFrom: requestTo, requestTo: userId, requestStatus: "Pending" }
      ]
    });

    if (requestExist) {
      console.log("Pending request already exists:", requestExist);
      return res.status(400).json({
        success: false,
        message: "Friend Request already sent."
      });
    }

    // Check if there's a previous request that was accepted/denied
    const oldRequest = await FriendRequest.findOne({
      $or: [
        { requestFrom: userId, requestTo: requestTo },
        { requestFrom: requestTo, requestTo: userId }
      ]
    });

    if (oldRequest && oldRequest.requestStatus === "accepted") {
      return res.status(400).json({
        success: false,
        message: "Already friends with this user."
      });
    }

    const newRequest = await FriendRequest.create({
      requestTo,
      requestFrom: userId,
      requestStatus: "Pending"
    });

    console.log("Friend request created:", newRequest);

    res.status(201).json({
      success: true,
      message: "Friend Request sent successfully",
    });
  } catch (error) {
    console.log("Friend request error:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

export const getFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body.user;

    const request = await FriendRequest.find({
      requestTo: userId,
      requestStatus: "Pending",
    })
      .populate({
        path: "requestFrom",
        select: "firstName lastName profileUrl profession -password",
      })
      .limit(10)
      .sort({
        _id: -1,
      });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    const id = req.body.user.userId;
    const { rid, status } = req.body;

    console.log("Accept request called:", { userId: id, rid, status });

    const requestExist = await FriendRequest.findById(rid);

    if (!requestExist) {
      console.log("Friend request not found:", rid);
      return res.status(404).json({
        success: false,
        message: "No Friend Request Found."
      });
    }

    console.log("Found request:", {
      requestFrom: requestExist.requestFrom,
      requestTo: requestExist.requestTo,
      currentStatus: requestExist.requestStatus
    });

    // Update request status
    await FriendRequest.findByIdAndUpdate(rid, { requestStatus: status });

    if (status === "Accepted") {
      // Add each user to the other's friends list
      await Users.findByIdAndUpdate(
        requestExist.requestTo, 
        { $addToSet: { friends: requestExist.requestFrom } }
      );
      
      await Users.findByIdAndUpdate(
        requestExist.requestFrom, 
        { $addToSet: { friends: requestExist.requestTo } }
      );

      console.log("Friendship established between:", {
        user1: requestExist.requestTo,
        user2: requestExist.requestFrom
      });
    }

    res.status(200).json({
      success: true,
      message: "Friend Request " + status,
    });
  } catch (error) {
    console.log("Accept request error:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

export const profileViews = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.body;

    const user = await Users.findById(id);

    user.views.push(userId);

    await user.save();

    res.status(201).json({
      success: true,
      message: "Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const suggestedFriends = async (req, res) => {
  try {
    const { userId } = req.body.user;

    console.log("Getting suggestions for user:", userId);

    // Get current user to access their friends list
    const currentUser = await Users.findById(userId).select('friends');
    console.log("Current user friends:", currentUser.friends);
    
    // Get ALL friend requests involving this user (sent and received)
    const allRequests = await FriendRequest.find({
      $or: [
        { requestFrom: userId },
        { requestTo: userId }
      ]
    }).select('requestFrom requestTo requestStatus');
    
    console.log("All friend requests for user:", allRequests);
    
    // Extract user IDs from all requests (both accepted and pending)
    const requestUserIds = allRequests.reduce((acc, req) => {
      if (req.requestFrom.toString() !== userId) acc.push(req.requestFrom);
      if (req.requestTo.toString() !== userId) acc.push(req.requestTo);
      return acc;
    }, []);

    console.log("Users to exclude from suggestions:", requestUserIds);

    // Exclude: self, current friends, and anyone with any friend request history
    const excludeIds = [
      userId,
      ...(currentUser.friends || []),
      ...requestUserIds
    ].map(id => id.toString()); // Convert to strings for comparison

    console.log("Final exclude list:", excludeIds);

    let queryResult = Users.find({
      _id: { $nin: excludeIds }
    })
      .limit(15)
      .select("firstName lastName profileUrl profession -password");

    const suggestedFriends = await queryResult;

    console.log("Suggested friends found:", suggestedFriends.length);

    res.status(200).json({
      success: true,
      data: suggestedFriends,
    });
  } catch (error) {
    console.log("Suggested friends error:", error);
    res.status(404).json({ message: error.message });
  }
};

export const unfriendUser = async (req, res, next) => {
  try {
    const id = req.body.user.userId;
    const { friendId } = req.body;

    console.log("Unfriend request:", { userId: id, friendId });

    // Remove each user from the other's friends list
    await Users.findByIdAndUpdate(
      id, 
      { $pull: { friends: friendId } }
    );
    
    await Users.findByIdAndUpdate(
      friendId, 
      { $pull: { friends: id } }
    );

    console.log("Friendship removed between:", { user1: id, user2: friendId });

    res.status(200).json({
      success: true,
      message: "Unfriended successfully"
    });
  } catch (error) {
    console.log("Unfriend error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unfriend user",
      error: error.message
    });
  }
};
