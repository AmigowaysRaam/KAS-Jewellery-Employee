// src/store/store.js
import { configureStore, createSlice } from '@reduxjs/toolkit';

// Slice for Auth
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    profile: {},
    siteDetails: {},
    profileDetails: {},
    token: null,
    SidebarMenu: null
  },
  reducers: {
    updateProfile: (state, action) => {
      state.profile = action.payload;
      //   console.log('[Auth Slice] Profile updated:', state.profile);
    },
    setProfileDetails: (state, action) => {
      state.profileDetails = action.payload;
    },
    setTokens: (state, action) => {
      state.token = action.payload;
      //   console.log('[Auth Slice] Token updated:', state.token);
    },
    setSiteDetails: (state, action) => {
      state.siteDetails = action.payload;
    },
    setSidebarMenu: (state, action) => {
      state.SidebarMenu = action.payload;
    },
  },
});
export const { updateProfile, setProfileDetails, setTokens, setSiteDetails,setSidebarMenu } = authSlice.actions;
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});
