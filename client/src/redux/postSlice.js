import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  posts: [],
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    getPosts(state, action) {
      state.posts = action.payload;
    },
    addPost(state, action) {
      // Add new post to the beginning of the array
      state.posts = [action.payload, ...state.posts];
    },
  },
});

export default postSlice.reducer;

export function SetPosts(post) {
  return (dispatch, getState) => {
    dispatch(postSlice.actions.getPosts(post));
  };
}

export function AddPost(post) {
  return (dispatch, getState) => {
    dispatch(postSlice.actions.addPost(post));
  };
}
