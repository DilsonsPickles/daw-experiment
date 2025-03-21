import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { repositionClip, moveClipToTrack } from '@/app/store';
import { ClipInterface } from '@/app/features/clips/clipTypes';
import { GRID_SIZE } from '@/app/constants';

/**
 * Custom hook for handling clip moving functionality with guidelines integration
 * @param clip The clip being moved
 * @param trackId The current track ID containing the clip
 * @param onPositionUpdate Optional callback for updating position during drag (for guidelines)
 * @param onDragStart Optional callback for notifying when drag starts (for guidelines)
 * @param onDragEnd Optional callback for cleanup when drag ends (for guidelines)
 */
export function useClipMove(
  clip: ClipInterface, 
  trackId: number, 
  onPositionUpdate?: (clipId: number, position: number) => void,
  onDragStart?: (clipId: number, trackId: number, position: number, width: number) => void,
  onDragEnd?: () => void
) {
  const dispatch = useDispatch();
  const offsetXRef = useRef<number>(0);
  
  /**
   * Handles the start of a drag operation
   */
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();

    const clipElement = e.currentTarget.closest("[data-clip-id]");
    if (!clipElement) return;

    // Calculate the offset from the left edge of the clip
    const rect = clipElement.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;

    // Store offset for use during drag
    offsetXRef.current = offsetX;

    // Use the offset as the x-coordinate for setDragImage
    e.dataTransfer.setDragImage(clipElement, offsetX, 0);

    // Set data for the drop operation
    e.dataTransfer.setData("clipId", clip.id.toString());
    e.dataTransfer.setData("sourceTrackId", trackId.toString());
    e.dataTransfer.setData("offsetX", offsetX.toString());

    // Notify guideline system if provided
    if (onDragStart) {
      onDragStart(clip.id, trackId, clip.position, clip.duration);
    }
  };

  /**
   * Handles the drag operation to update position for guidelines
   */
  const handleDrag = (e: React.DragEvent) => {
    if (e.clientX === 0) return; // Skip invalid drag events

    const trackElement = e.currentTarget.closest('[class*="trackContainer"]');
    if (!trackElement) return;

    const trackRect = trackElement.getBoundingClientRect();
    const offsetX = offsetXRef.current;

    // Calculate new clip position based on cursor position and drag offset
    const newPosition = Math.max(0, e.clientX - trackRect.left - offsetX);

    // Notify guideline system about position change if provided
    if (onPositionUpdate) {
      onPositionUpdate(clip.id, newPosition);
    }
  };

  /**
   * Handles the end of a drag operation
   */
  const handleDragEnd = (e: React.DragEvent) => {
    // Always make sure to clear guidelines, even if drop occurs outside a valid target
    if (onDragEnd) {
      onDragEnd();
    }
  };

  /**
   * Handle dropping clip on a track
   * @param e The drop event
   * @param targetTrackId The track ID receiving the drop
   */
  const handleDrop = (e: React.DragEvent, targetTrackId: number) => {
    e.preventDefault();
    
    const clipId = parseInt(e.dataTransfer.getData("clipId"));
    const sourceTrackId = parseInt(e.dataTransfer.getData("sourceTrackId"));
    const offsetX = parseInt(e.dataTransfer.getData("offsetX") || "0");
  
    if (isNaN(clipId) || isNaN(sourceTrackId)) return;
    
    // Calculate the raw position where the clip was dropped
    const trackRect = e.currentTarget.getBoundingClientRect();
    const rawPosition = Math.max(0, e.clientX - trackRect.left - offsetX);
    
    // Snap to grid
    const snappedPosition = Math.round(rawPosition / GRID_SIZE) * GRID_SIZE;
  
    // If it's the same track, reposition the clip
    if (sourceTrackId === targetTrackId) {
      dispatch(
        repositionClip({
          trackId: targetTrackId,
          clipId,
          newPosition: snappedPosition,
        })
      );
    } else {
      // Moving between tracks
      dispatch(
        moveClipToTrack({
          sourceTrackId,
          targetTrackId,
          clipId,
          newPosition: snappedPosition,
        })
      );
    }
  };

  return {
    offsetX: offsetXRef.current,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    handleDrop
  };
}