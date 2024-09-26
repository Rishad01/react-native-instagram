import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/useSlice';
import postsReducer from './slices/postsSlice';
import followingReducer from './slices/followingSlice';

const store = configureStore({
  reducer: {
    user: userReducer, // Add the user reducer to the store
    posts: postsReducer, // Add the posts slice to the store
    following: followingReducer,
  },
});

export default store;
