// features/selection/selectionSelectors.ts
import { TrackInterface } from "../tracks/trackTypes";

interface SelectionState {
  selectedTrackId: number | null;
  selectedClipId: number | null;
}

// Basic selectors
export const selectSelectedTrackId = (state: { selection: SelectionState }) => 
  state.selection.selectedTrackId;

export const selectSelectedClipId = (state: { selection: SelectionState }) => 
  state.selection.selectedClipId;

// Derived selectors
export const selectSelectedTrack = (state: { 
  selection: SelectionState, 
  tracks: { tracks: TrackInterface[] } 
}) => {
  const selectedId = state.selection.selectedTrackId;
  return selectedId !== null
    ? state.tracks.tracks.find(track => track.trackHeader.id === selectedId) || null
    : null;
};

export const selectSelectedClip = (state: { 
  selection: SelectionState, 
  tracks: { tracks: TrackInterface[] } 
}) => {
  const selectedTrackId = state.selection.selectedTrackId;
  const selectedClipId = state.selection.selectedClipId;

  if (selectedTrackId === null || selectedClipId === null) {
    return null;
  }

  const track = state.tracks.tracks.find(track => track.trackHeader.id === selectedTrackId);
  if (!track) return null;

  return track.clips.find(clip => clip.id === selectedClipId) || null;
};

// Additional useful selectors
export const selectHasSelection = (state: { selection: SelectionState }) => 
  state.selection.selectedTrackId !== null;

export const selectHasClipSelection = (state: { selection: SelectionState }) => 
  state.selection.selectedClipId !== null && state.selection.selectedTrackId !== null;

// Get selected track index (useful for UI highlighting)
export const selectSelectedTrackIndex = (state: { 
  selection: SelectionState, 
  tracks: { tracks: TrackInterface[] } 
}) => {
  const selectedId = state.selection.selectedTrackId;
  if (selectedId === null) return -1;
  
  return state.tracks.tracks.findIndex(track => track.trackHeader.id === selectedId);
};