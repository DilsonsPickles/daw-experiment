// features/tracks/trackSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TrackInterface, RenameTrackPayload } from "./trackTypes";

interface TrackState {
  tracks: TrackInterface[];
}

const initialState: TrackState = {
  tracks: [
    {
      trackHeader: {
        name: "Mono track 1",
        id: 1,
        type: "Mono",
        volume: 50,
        pan: 50,
        mute: false,
        solo: false,
      },
      clips: [],
    },
  ],
};

export const trackSlice = createSlice({
  name: "tracks",
  initialState,
  reducers: {
    addTrack: (state, action: PayloadAction<string>) => {
      const trackType = action.payload;
      const newTrackId = state.tracks.length + 1;

      const newTrack: TrackInterface = {
        trackHeader: {
          name: `${trackType} track ${newTrackId}`,
          id: newTrackId,
          type: trackType,
          volume: 50,
          pan: 50,
          mute: false,
          solo: false,
        },
        clips: [],
      };

      state.tracks.push(newTrack);
    },

    // New action for creating a track with a specific ID when dragging to empty space
    createTrack: (state, action: PayloadAction<{ id: number; name: string }>) => {
      const { id, name } = action.payload;
      
      const newTrack: TrackInterface = {
        trackHeader: {
          name: name,
          id: id,
          type: "Mono", // Default type, you might want to make this configurable
          volume: 50,
          pan: 50,
          mute: false,
          solo: false,
        },
        clips: [],
      };

      state.tracks.push(newTrack);
    },

    removeTrack: (state, action: PayloadAction<number>) => {
      const trackId = action.payload;
      state.tracks = state.tracks.filter(
        (track) => track.trackHeader.id !== trackId
      );
    },

    renameTrack: (state, action: PayloadAction<RenameTrackPayload>) => {
      const { id, name } = action.payload;
      const track = state.tracks.find((track) => track.trackHeader.id === id);
      if (track) {
        track.trackHeader.name = name;
      }
    },

    moveTrack: (
      state,
      action: PayloadAction<{ trackId: number; newIndex: number }>
    ) => {
      const { trackId, newIndex } = action.payload;
      const currentIndex = state.tracks.findIndex(
        (track) => track.trackHeader.id === trackId
      );

      if (
        currentIndex !== -1 &&
        newIndex >= 0 &&
        newIndex < state.tracks.length
      ) {
        const [trackToMove] = state.tracks.splice(currentIndex, 1);
        state.tracks.splice(newIndex, 0, trackToMove);
      }
    },
  },
});

// Export the actions
export const { addTrack, createTrack, removeTrack, renameTrack, moveTrack } = trackSlice.actions;

// Export the reducer
export default trackSlice.reducer;