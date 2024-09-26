import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs } from 'firebase/firestore';
import { auth,db } from '../../firebase'; // Adjust based on your Firebase setup

// Thunk to fetch following list from Firestore
export const fetchFollowingList = createAsyncThunk(
  'following/fetchFollowingList',
  async (currentUserId, { rejectWithValue }) => {
    try {
        console.log("hello");
        console.log(currentUserId)
      const followingCollectionRef = collection(db, 'following', auth.currentUser.uid, 'followingList');
      const querySnapshot = await getDocs(followingCollectionRef);

      const followingList = querySnapshot.docs.map((doc) => doc.id); // Get the IDs of the users the current user is following
      return followingList;
    } catch (error) {
      return rejectWithValue('Error fetching following list');
    }
  }
);

const followingSlice = createSlice({
  name: 'following',
  initialState: {
    followingList: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetching the following list
      .addCase(fetchFollowingList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowingList.fulfilled, (state, action) => {
        state.followingList = action.payload;
        state.loading = false;
      })
      .addCase(fetchFollowingList.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export default followingSlice.reducer;
