// features/clips/clipSelectors.ts
import { TrackInterface } from "../tracks/trackTypes";

// Select all clips from a specific track
export const selectClipsByTrackId = (state: { tracks: { tracks: TrackInterface[] } }, trackId: number) => {
  const track = state.tracks.tracks.find(track => track.trackHeader.id === trackId);
  return track ? track.clips : [];
};

// Select a specific clip by track ID and clip ID
export const selectClipById = (
  state: { tracks: { tracks: TrackInterface[] } },
  trackId: number,
  clipId: number
) => {
  const track = state.tracks.tracks.find(track => track.trackHeader.id === trackId);
  if (!track) return null;
  
  return track.clips.find(clip => clip.id === clipId) || null;
};

// Select all clips across all tracks
export const selectAllClips = (state: { tracks: { tracks: TrackInterface[] } }) => {
  return state.tracks.tracks.flatMap(track => 
    track.clips.map(clip => ({
      ...clip,
      trackId: track.trackHeader.id
    }))
  );
};

// Count total number of clips
export const selectClipCount = (state: { tracks: { tracks: TrackInterface[] } }) => {
  return state.tracks.tracks.reduce((count, track) => count + track.clips.length, 0);
};

// In clipSelectors.ts
export const selectMaxClipPosition = (state: { tracks: { tracks: TrackInterface[] } }) => {
  const allClips = selectAllClips(state);
  if (allClips.length === 0) return 0;
  
  return Math.max(...allClips.map(clip => clip.position + clip.duration));
};