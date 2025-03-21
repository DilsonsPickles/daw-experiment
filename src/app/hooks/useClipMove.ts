import { useRef, useEffect } from 'react';
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
  const isDraggingRef = useRef(false);
  
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
    isDraggingRef.current = true;

    // Use the offset as the x-coordinate for setDragImage
    e.dataTransfer.setDragImage(clipElement, offsetX, 0);

    // Set data for the drop operation
    e.dataTransfer.setData("clipId", clip.id.toString());
    e.dataTransfer.setData("sourceTrackId", trackId.toString());
    e.dataTransfer.setData("offsetX", offsetX.toString());

    // Notify guideline system if provided
    if (onDragStart) {
      // This is critical - we need to pass the current position and width
      onDragStart(clip.id, trackId, clip.position, clip.duration);
    }
    
    // Add global mousemove listener
    document.addEventListener('mousemove', handleGlobalMouseMove);
  };

  /**
   * Global mouse move handler for more accurate tracking
   */
  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    // Find the track element under the cursor
    const trackElements = document.querySelectorAll('[class*="trackContainer"]');
    for (const trackElement of trackElements) {
      const rect = trackElement.getBoundingClientRect();
      
      // Check if mouse is over this track
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        // Calculate position relative to track
        const newPosition = Math.max(0, e.clientX - rect.left - offsetXRef.current);
        
        // Update guideline position
        if (onPositionUpdate) {
          onPositionUpdate(clip.id, newPosition);
        }
        
        // No need to check other tracks
        break;
      }
    }
  };

  /**
   * Handles the drag operation (may not fire continuously in all browsers)
   */
  const handleDrag = (e: React.DragEvent) => {
    // Skip events with invalid coordinates
    if (e.clientX === 0 && e.clientY === 0) return;

    const trackElement = e.currentTarget.closest('[class*="trackContainer"]');
    if (!trackElement) return;

    const trackRect = trackElement.getBoundingClientRect();
    const newPosition = Math.max(0, e.clientX - trackRect.left - offsetXRef.current);

    // Update guideline position
    if (onPositionUpdate) {
      onPositionUpdate(clip.id, newPosition);
    }
  };

  /**
   * Handles the end of a drag operation
   */
  const handleDragEnd = (e: React.DragEvent) => {
    // Reset dragging state
    isDraggingRef.current = false;
    
    // Clean up event listeners
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    
    // Notify guideline system
    if (onDragEnd) {
      onDragEnd();
    }
  };

  /**
   * Handle dropping clip on a track
   */
  const handleDrop = (e: React.DragEvent, targetTrackId: number) => {
    e.preventDefault();
    
    const clipId = parseInt(e.dataTransfer.getData("clipId"));
    const sourceTrackId = parseInt(e.dataTransfer.getData("sourceTrackId"));
    const offsetX = parseInt(e.dataTransfer.getData("offsetX") || "0");
  
    if (isNaN(clipId) || isNaN(sourceTrackId)) return;
    
    // Calculate drop position
    const trackRect = e.currentTarget.getBoundingClientRect();
    const rawPosition = Math.max(0, e.clientX - trackRect.left - offsetX);
    const snappedPosition = Math.round(rawPosition / GRID_SIZE) * GRID_SIZE;
  
    // Handle same track vs. different track
    if (sourceTrackId === targetTrackId) {
      dispatch(
        repositionClip({
          trackId: targetTrackId,
          clipId,
          newPosition: snappedPosition,
        })
      );
    } else {
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

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, []);

  return {
    offsetX: offsetXRef.current,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    handleDrop
  };
}