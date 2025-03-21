// features/clips/clipSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ClipInterface, RenameClipPayload } from "./clipTypes";
import { TrackInterface } from "../tracks/trackTypes";

// We don't need a separate clips state since clips are stored within tracks
// This slice will provide actions that modify the tracks state

export const clipSlice = createSlice({
  name: "clips",
  initialState: {}, // Empty state since we're operating on the tracks state
  reducers: {},
});

// Define actions that will be used by the root store
export const addClipAction = (
    state: { tracks: { tracks: TrackInterface[] } },
    action: PayloadAction<{ trackId: number; clip: Partial<ClipInterface> }>
  ) => {
    const { trackId, clip } = action.payload;
    const track = state.tracks.tracks.find(track => track.trackHeader.id === trackId);
  
    if (track) {
      // Get the next clip ID
      const clipId = track.clips.length > 0
        ? Math.max(...track.clips.map(c => c.id % 1000)) + 1
        : 1;
      
      // Calculate position: after the rightmost clip or 0 if no clips
      const newPosition = track.clips.length > 0
        ? Math.max(...track.clips.map(c => c.position + c.duration))
        : 0;
      
      // Create a globally unique ID
      const globalClipId = trackId * 1000 + clipId;
  
      const newClip: ClipInterface = {
        id: globalClipId,
        name: clip.name || `Clip ${trackId}.${clipId}`,
        color: clip.color || "#3498db",
        position: clip.position !== undefined ? clip.position : newPosition,
        duration: clip.duration || 140,
      };
  
      track.clips = [...track.clips, newClip];
    }
  };

export const removeClipAction = (
  state: { tracks: { tracks: TrackInterface[] } },
  action: PayloadAction<{ trackId: number; clipId: number }>
) => {
  const { trackId, clipId } = action.payload;
  const track = state.tracks.tracks.find(
    (track) => track.trackHeader.id === trackId
  );

  if (track) {
    track.clips = track.clips.filter((clip) => clip.id !== clipId);
  }
};

export const renameClipAction = (
  state: { tracks: { tracks: TrackInterface[] } },
  action: PayloadAction<RenameClipPayload>
) => {
  const { trackId, clipId, name } = action.payload;
  const track = state.tracks.tracks.find(
    (track) => track.trackHeader.id === trackId
  );

  if (track) {
    const clip = track.clips.find((clip) => clip.id === clipId);
    if (clip) {
      clip.name = name;
    }
  }
};

export const repositionClipAction = (
  state: { tracks: { tracks: TrackInterface[] } },
  action: PayloadAction<{
    trackId: number;
    clipId: number;
    newPosition: number;
  }>
) => {
  const { trackId, clipId, newPosition } = action.payload;
  const track = state.tracks.tracks.find(
    (track) => track.trackHeader.id === trackId
  );

  if (track) {
    const clip = track.clips.find((clip) => clip.id === clipId);
    if (clip) {
      clip.position = newPosition;
    }
  }
};

export const moveClipToTrackAction = (
  state: { tracks: { tracks: TrackInterface[] } },
  action: PayloadAction<{
    sourceTrackId: number;
    targetTrackId: number;
    clipId: number;
    newPosition?: number;
  }>
) => {
  const { sourceTrackId, targetTrackId, clipId, newPosition = 0 } = action.payload;
  
  // Find source track index
  const sourceTrackIndex = state.tracks.tracks.findIndex(
    (track) => track.trackHeader.id === sourceTrackId
  );
  
  if (sourceTrackIndex === -1) return;
  
  // Find clip to move
  const sourceTrack = state.tracks.tracks[sourceTrackIndex];
  const clipIndex = sourceTrack.clips.findIndex((clip) => clip.id === clipId);
  
  if (clipIndex === -1) return;
  
  // Create a copy of the clip with the new position
  const clipToMove = {
    ...sourceTrack.clips[clipIndex],
    position: newPosition
  };
  
  // Find target track index
  const targetTrackIndex = state.tracks.tracks.findIndex(
    (track) => track.trackHeader.id === targetTrackId
  );
  
  if (targetTrackIndex === -1) return;
  
  // Create new clips array for source track without the moved clip
  state.tracks.tracks[sourceTrackIndex] = {
    ...sourceTrack,
    clips: sourceTrack.clips.filter((clip) => clip.id !== clipId)
  };
  
  // Add clip to target track
  state.tracks.tracks[targetTrackIndex] = {
    ...state.tracks.tracks[targetTrackIndex],
    clips: [...state.tracks.tracks[targetTrackIndex].clips, clipToMove]
  };
};

export const resizeClipAction = (
    state: { tracks: { tracks: TrackInterface[] } },
    action: PayloadAction<{
      trackId: number;
      clipId: number;
      newDuration: number;
    }>
  ) => {
    const { trackId, clipId, newDuration } = action.payload;
    const track = state.tracks.tracks.find(track => track.trackHeader.id === trackId);
    
    if (track) {
      const clip = track.clips.find(clip => clip.id === clipId);
      if (clip) {
        clip.duration = Math.max(20, newDuration);
      }
    }
  };
  
  export const repositionAndResizeClipAction = (
    state: { tracks: { tracks: TrackInterface[] } },
    action: PayloadAction<{
      trackId: number;
      clipId: number;
      newPosition: number;
      newDuration: number;
    }>
  ) => {
    const { trackId, clipId, newPosition, newDuration } = action.payload;
    const track = state.tracks.tracks.find(track => track.trackHeader.id === trackId);
    
    if (track) {
      const clip = track.clips.find(clip => clip.id === clipId);
      if (clip) {
        clip.position = newPosition;
        clip.duration = Math.max(20, newDuration);
      }
    }
  };
  
  // Also add these to your store.ts action creators:

