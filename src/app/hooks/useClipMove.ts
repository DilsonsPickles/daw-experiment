import { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { repositionClip, moveClipToTrack } from '@/app/store';
import { ClipInterface } from '@/app/features/clips/clipTypes';
import { GRID_SIZE } from '@/app/constants';
import { useGuidelines } from '@/app/features/guidelines/guidelines-implementation';

/**
 * Custom hook for handling clip moving functionality with guidelines integration
 */
export function useClipMove(clip: ClipInterface, trackId: number) {
  const dispatch = useDispatch();
  const offsetXRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  
  // Get guidelines functions directly from context
  const { startTracking, updatePosition, stopTracking } = useGuidelines();
  
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

    // Start tracking for guidelines - similar to how it's done in useClipResize
    startTracking(clip.id, trackId, clip.position, clip.duration);
    
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
        updatePosition(clip.id, newPosition);
        
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
    updatePosition(clip.id, newPosition);
  };

  /**
   * Handles the end of a drag operation
   */
  const handleDragEnd = (e: React.DragEvent) => {
    // Reset dragging state
    isDraggingRef.current = false;
    
    // Clean up event listeners
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    
    // Stop guideline tracking
    stopTracking();
  };

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      if (isDraggingRef.current) {
        stopTracking();
      }
    };
  }, []);

  return {
    handleDragStart,
    handleDrag,
    handleDragEnd
  };
}