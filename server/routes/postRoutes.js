import express from "express";
import userAuth from "../middleware/authMiddleware.js";
import {
  commentPost,
  createPost,
  deletePost,
  getComments,
  getPost,
  getPosts,
  getUserPost,
  likePost,
  likePostComment,
  replyPostComment,
} from "../controllers/postController.js";

const router = express.Router();

// crete post
router.post("/create-post", userAuth, createPost);
// get posts
router.post("/", userAuth, getPosts);

// get user posts - must come before /:id route
router.post("/get-user-post/:id", userAuth, getUserPost);
router.post("/user", userAuth, getUserPost);

router.post("/:id", userAuth, getPost);

// get comments
router.get("/comments/:postId", getComments);

//like and comment on posts
router.post("/like/:id", userAuth, likePost);
router.post("/like-comment/:id/:rid?", userAuth, likePostComment);
router.post("/comment/:id", userAuth, commentPost);
router.post("/reply-comment/:id", userAuth, replyPostComment);

//delete post
router.delete("/:id", userAuth, deletePost);

export default router;
