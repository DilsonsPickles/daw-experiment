// features/tracks/trackSelectors.ts
import { TrackInterface } from "./trackTypes";

// Basic selectors
export const selectTracks = (state: { tracks: { tracks: TrackInterface[] } }) => 
  state.tracks.tracks;

export const selectTrackHeaders = (state: { tracks: { tracks: TrackInterface[] } }) => 
  state.tracks.tracks.map(track => track.trackHeader);

export const selectTrackById = (
  state: { tracks: { tracks: TrackInterface[] } }, 
  id: number
) => 
  state.tracks.tracks.find(track => track.trackHeader.id === id);

// Additional useful selectors
export const selectTrackCount = (state: { tracks: { tracks: TrackInterface[] } }) => 
  state.tracks.tracks.length;

export const selectTrackByIndex = (
  state: { tracks: { tracks: TrackInterface[] } }, 
  index: number
) => {
  const tracks = state.tracks.tracks;
  return index >= 0 && index < tracks.length ? tracks[index] : null;
};

export const selectTrackIndexById = (
  state: { tracks: { tracks: TrackInterface[] } }, 
  id: number
) => 
  state.tracks.tracks.findIndex(track => track.trackHeader.id === id);

// For specific track properties
export const selectTrackTypeById = (
  state: { tracks: { tracks: TrackInterface[] } }, 
  id: number
) => {
  const track = selectTrackById(state, id);
  return track ? track.trackHeader.type : null;
};

// Track statistics
export const selectTracksByType = (
  state: { tracks: { tracks: TrackInterface[] } }, 
  type: string
) => 
  state.tracks.tracks.filter(track => track.trackHeader.type === type);
  