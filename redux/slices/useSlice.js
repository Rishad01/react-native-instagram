import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,  // This is where user data will be stored after registration
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
        console.log(action.payload);
      state.user = action.payload;  // Save the user data
    },
    clearUser: (state) => {
      state.user = null;  // Clear user data on logout or reset
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
