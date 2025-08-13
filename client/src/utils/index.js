import axios from "axios";
import { SetPosts } from "../redux/postSlice";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8800";

// Log environment variables on module load
console.log("=== Environment Variables Check ===");
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("VITE_CLOUDINARY_CLOUD_NAME:", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
console.log("VITE_CLOUDINARY_UPLOAD_PRESET:", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
console.log("VITE_CLOUDINARY_API_KEY:", import.meta.env.VITE_CLOUDINARY_API_KEY ? "Present" : "Not set");
console.log("=== End Environment Variables ===");

export const API = axios.create({
  baseURL: API_URL,
  responseType: "json",
});

export const apiRequest = async ({ url, token, data, method }) => {
  try {
    const result = await API(url, {
      method: method || "GET",
      data: data,
      headers: {
        "content-type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return result?.data;
  } catch (error) {
    let err = error?.response?.data || { success: "failed", message: "Network error" };
    return { status: err.success, message: err.message };
  }
};


export const handleFileUpload = async (uploadFile) => {
  console.log("=== Starting File Upload ===");
  console.log("File details:", {
    name: uploadFile.name,
    size: uploadFile.size,
    type: uploadFile.type,
  });

  // Validate file
  if (!uploadFile) {
    throw new Error("No file provided");
  }

  if (uploadFile.size > 10 * 1024 * 1024) { // 10MB limit
    throw new Error("File size too large. Maximum size is 10MB");
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(uploadFile.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed");
  }

  const formData = new FormData();
  formData.append("file", uploadFile);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  
  // Add API key if available (for signed uploads)
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  if (apiKey) {
    formData.append("api_key", apiKey);
  }
  
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
    // Log environment variables for debugging
    console.log("Cloudinary Config:");
    console.log("Cloud Name:", cloudName);
    console.log("Upload Preset:", uploadPreset);
    console.log("API Key:", apiKey ? "Present" : "Not provided");
    console.log("File size:", uploadFile.size);
    console.log("File type:", uploadFile.type);
    
    if (!cloudName || !uploadPreset) {
      throw new Error("Missing Cloudinary configuration. Check environment variables.");
    }
    
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    console.log("Upload URL:", uploadUrl);
    
    console.log("Making request to Cloudinary...");
    const response = await axios.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout
    });
    
    console.log("Cloudinary response:", response.data);
    console.log("Cloudinary upload successful:", response.data.secure_url);
    return response.data.secure_url;
  } catch (error) {
    console.error("=== Cloudinary Upload Error ===");
    console.error("Error message:", error.message);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    console.error("Error config:", error.config);
    console.error("Full error:", error);
    
    if (error.response?.status === 400) {
      throw new Error(`Upload failed: ${error.response.data?.error?.message || 'Bad request'}`);
    } else if (error.response?.status === 401) {
      throw new Error("Upload failed: Invalid credentials or upload preset");
    } else if (error.response?.status === 404) {
      throw new Error("Upload failed: Cloud name or upload preset not found");
    } else {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
};

export const fetchPosts = async (token, dispatch, uri, data) => {
  try {
    console.log("fetchPosts called with:", { uri, data });
    const res = await apiRequest({
      url: uri || "/posts",
      token: token,
      method: "POST",
      data: data || {},
    });
    console.log("fetchPosts response:", res);
    console.log("Posts data to dispatch:", res?.data);
    dispatch(SetPosts(res?.data));
    return;
  } catch (error) {
    console.log("fetchPosts error:", error);
  }
};

export const likePost = async ({ uri, token }) => {
  try {
    const res = await apiRequest({
      url: uri,
      token: token,
      method: "POST",
    });
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const deletePost = async (id, token) => {
  try {
    const res = await apiRequest({
      url: `/posts/${id}`,
      token: token,
      method: "DELETE",
    });
    return;
  } catch (error) {
    console.log(error);
  }
};

export const getUserInfo = async (token, id) => {
  try {
    const uri = id === undefined ? "/users/get-user" : `/users/get-user/${id}`;
    const res = await apiRequest({
      url: uri,
      token: token,
      method: "POST",
    });
    if (res?.message === "Authentication failed") {
      localStorage.removeItem("user");
      window.alert("User session expired. Login again.");
      window.location.replace("/login");
    }
    return res?.user;
  } catch (error) {
    console.log(error);
  }
};

export const sendFriendRequest = async (token, id) => {
  try {
    console.log("Sending friend request:", { token: token ? "Present" : "Missing", requestTo: id });
    const res = await apiRequest({
      url: "/users/friend-request",
      token: token,
      method: "POST",
      data: { requestTo: id },
    });
    console.log("Friend request response:", res);
    return res;
  } catch (error) {
    console.log("Friend request error:", error);
  }
};

export const viewUserProfile = async (token, id) => {
  try {
    const res = await apiRequest({
      url: "/users/profile-view",
      token: token,
      method: "POST",
      data: { id },
    });
    return;
  } catch (error) {
    console.log(error);
  }
};

export const createPost = async (token, data) => {
  try {
    console.log("createPost frontend called with:", data);
    const res = await apiRequest({
      url: "/posts/create-post",
      token,
      method: "POST",
      data,
    });
    console.log("createPost frontend response:", res);
    return res;
  } catch (error) {
    console.log("createPost frontend error:", error);
  }
};

export const addComment = async (token, postId, comment, user) => {
  try {
    const from = user ? `${user.firstName} ${user.lastName}` : "Anonymous User";
    const res = await apiRequest({
      url: `/posts/comment/${postId}`,
      token,
      method: "POST",
      data: { comment, from },
    });
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const replyComment = async (token, commentId, comment, replyAt, user) => {
  try {
    const from = user ? `${user.firstName} ${user.lastName}` : "Anonymous User";
    const res = await apiRequest({
      url: `/posts/reply-comment/${commentId}`,
      token,
      method: "POST",
      data: { comment, replyAt, from },
    });
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const fetchComments = async (token, postId) => {
  try {
    const res = await apiRequest({
      url: `/posts/comments/${postId}`,
      token,
      method: "GET",
    });
    return res?.data;
  } catch (error) {
    console.log(error);
  }
};

export const acceptFriendRequest = async (token, rid, status) => {
  console.log("acceptFriendRequest called:", { rid, status });
  try {
    const res = await apiRequest({
      url: "/users/accept-request",
      token,
      method: "POST",
      data: { rid, status },
    });
    console.log("acceptFriendRequest response:", res);
    return res;
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return { status: false, message: error.message };
  }
};

export const unfriendUser = async (token, friendId) => {
  try {
    const res = await apiRequest({
      url: "/users/unfriend",
      token,
      method: "POST",
      data: { friendId },
    });
    return res;
  } catch (error) {
    console.error("Error unfriending user:", error);
    return { status: false, message: error.message };
  }
};

export const fetchFriendRequests = async (token) => {
  try {
    const res = await apiRequest({
      url: "/users/get-friend-request",
      token,
      method: "POST",
    });
    return res?.data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchSuggestedFriends = async (token) => {
  try {
    const res = await apiRequest({
      url: "/users/suggested-friends",
      token,
      method: "POST",
    });
    return res?.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateUserProfile = async (token, data) => {
  try {
    const res = await apiRequest({
      url: "/users/update-user",
      token,
      method: "PUT",
      data,
    });
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const fetchUserDetails = async (token) => {
  try {
    const res = await apiRequest({
      url: "/users/get-user",
      token,
      method: "POST",
    });
    return res;
  } catch (error) {
    console.error("Error fetching user details:", error);
    return { status: false, message: error.message };
  }
};