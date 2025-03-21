// app/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import trackReducer from "@/app/features/tracks/trackSlice";
import selectionReducer from "@/app/features/selection/selectionSlice";
import { produce } from "immer";
import {
  addClipAction,
  removeClipAction,
  renameClipAction,
  repositionClipAction,
  moveClipToTrackAction,
  resizeClipAction,
  repositionAndResizeClipAction,
} from "@/app/features/clips/clipSlice";

// We need to create actions that will be dispatched
import { createAction } from "@reduxjs/toolkit";
import { ClipInterface } from "@/app/features/clips/clipTypes";

// Clip actions
export const addClip = createAction<{
  trackId: number;
  clip: Partial<ClipInterface>;
}>("clips/addClip");
export const removeClipFromTrack = createAction<{
  trackId: number;
  clipId: number;
}>("clips/removeClipFromTrack");
export const renameClip = createAction<{
  trackId: number;
  clipId: number;
  name: string;
}>("clips/renameClip");
export const repositionClip = createAction<{
  trackId: number;
  clipId: number;
  newPosition: number;
}>("clips/repositionClip");
export const moveClipToTrack = createAction<{
  sourceTrackId: number;
  targetTrackId: number;
  clipId: number;
  newPosition?: number;
}>("clips/moveClipToTrack");
export const resizeClip = createAction<{
  trackId: number;
  clipId: number;
  newDuration: number;
}>("clips/resizeClip");
export const repositionAndResizeClip = createAction<{
  trackId: number;
  clipId: number;
  newPosition: number;
  newDuration: number;
}>("clips/repositionAndResizeClip");
export const createTrack = createAction<{ id: number; name: string }>(
  "tracks/createTrack"
);

// Create the root reducer with the slice reducers
const rootReducer = combineReducers({
  tracks: trackReducer,
  selection: selectionReducer,
});

// Create a reducer enhancer to handle clip actions
const enhancedReducer = (state: any, action: any) => {
  let newState = rootReducer(state, action);

  // Use Immer's produce to handle immutability
  return produce(newState, (draftState) => {
    // Handle clip actions that need to modify the tracks state
    if (addClip.match(action)) {
      addClipAction({ tracks: draftState.tracks }, action);
    } else if (removeClipFromTrack.match(action)) {
      removeClipAction({ tracks: draftState.tracks }, action);
    } else if (renameClip.match(action)) {
      renameClipAction({ tracks: draftState.tracks }, action);
    } else if (repositionClip.match(action)) {
      repositionClipAction({ tracks: draftState.tracks }, action);
    } else if (moveClipToTrack.match(action)) {
      moveClipToTrackAction({ tracks: draftState.tracks }, action);
    }
    if (resizeClip.match(action)) {
      resizeClipAction({ tracks: draftState.tracks }, action);
    } else if (repositionAndResizeClip.match(action)) {
      repositionAndResizeClipAction({ tracks: draftState.tracks }, action);
    }
  });
};

// Configure the store with the enhanced reducer
const store = configureStore({
  reducer: enhancedReducer,
});

// Export types and store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;

// Re-export actions from slices
export {
  addTrack,
  removeTrack,
  renameTrack,
  moveTrack,
} from "@/app/features/tracks/trackSlice";

export {
  selectTrack,
  selectClip,
  clearSelection,
} from "@/app/features/selection/selectionSlice";

// Re-export selectors
export {
  selectTracks,
  selectTrackHeaders,
  selectTrackById,
  selectTrackCount,
  selectTrackByIndex,
  selectTrackIndexById,
  selectTrackTypeById,
  selectTracksByType,
} from "@/app/features/tracks/trackSelectors"; // Changed from trackSlice to trackSelectors

export {
  selectSelectedTrackId,
  selectSelectedClipId,
  selectSelectedTrack,
  selectSelectedClip,
  selectHasSelection,
  selectHasClipSelection,
  selectSelectedTrackIndex,
} from "@/app/features/selection/selectionSelectors";

export {
  selectClipsByTrackId,
  selectClipById,
  selectAllClips,
  selectClipCount,
  selectMaxClipPosition,
} from "@/app/features/clips/clipSelectors";
