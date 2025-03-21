// features/selection/selectionSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SelectClipPayload } from "./selectionTypes";

interface SelectionState {
  selectedTrackId: number | null;
  selectedClipId: number | null;
}

const initialState: SelectionState = {
  selectedTrackId: 1, // Default to first track
  selectedClipId: null,
};

export const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    selectTrack: (state, action: PayloadAction<number>) => {
      state.selectedTrackId = action.payload;
      state.selectedClipId = null; // Clear clip selection when selecting a track
    },

    selectClip: (state, action: PayloadAction<SelectClipPayload>) => {
      const { trackId, clipId } = action.payload;
      state.selectedTrackId = trackId;
      state.selectedClipId = clipId;
    },

    clearSelection: (state) => {
      state.selectedTrackId = null;
      state.selectedClipId = null;
    },
  },
  extraReducers: (builder) => {
    // When a track is removed, clear its selection if it was selected
    // We'll add this in the root store configuration
  }
});

export const { selectTrack, selectClip, clearSelection } = selectionSlice.actions;
export default selectionSlice.reducer;