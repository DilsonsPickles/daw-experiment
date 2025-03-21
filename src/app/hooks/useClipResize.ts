import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resizeClip, repositionClip } from '@/app/store';
import { ClipInterface } from '@/app/features/clips/clipTypes';
import { selectTracks } from '@/app/store';
import { GRID_SIZE } from '@/app/constants';
import { useGuidelines } from '@/app/features/guidelines/guidelines-implementation';

// Main gridline size in pixels (matching the 140px from your canvas)
const MAJOR_GRID_SIZE = 140;

// Resize edge type
type ResizeEdge = 'left' | 'right' | null;

/**
 * Enhanced clip resize hook that includes guideline functionality for both edges
 */
export function useClipResize(clip: ClipInterface, trackId: number) {
  const [isResizing, setIsResizing] = useState(false);
  const [cursor, setCursor] = useState('auto');
  
  // Add state for current visual dimensions during resize
  const [currentWidth, setCurrentWidth] = useState(clip.duration);
  const [currentPosition, setCurrentPosition] = useState(clip.position);
  
  const dispatch = useDispatch();
  const tracks = useSelector(selectTracks);
  
  // Get guidelines functionality
  const { startTracking, updatePosition, stopTracking } = useGuidelines();

  // Store reference to the clip element and resize state
  const resizeInfoRef = useRef({
    isResizing: false,
    startX: 0,
    initialWidth: 0,
    initialPosition: 0,
    edge: null as ResizeEdge
  });

  // Create a stable reference to the stopTracking function
  const stopTrackingRef = useRef(stopTracking);
  
  // Update the ref when stopTracking changes
  useEffect(() => {
    stopTrackingRef.current = stopTracking;
  }, [stopTracking]);
  
  // Update current dimensions when clip properties change from outside
  useEffect(() => {
    if (!isResizing) {
      setCurrentWidth(clip.duration);
      setCurrentPosition(clip.position);
    }
  }, [clip.duration, clip.position, isResizing]);

  // Memoize key handlers to prevent recreating them on each render
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeInfoRef.current.isResizing || !resizeInfoRef.current.edge) return;
    
    const deltaX = e.clientX - resizeInfoRef.current.startX;
    
    if (resizeInfoRef.current.edge === 'right') {
      // Resizing from right edge - only width changes
      const newWidth = Math.max(50, resizeInfoRef.current.initialWidth + deltaX);
      setCurrentWidth(newWidth);
      
      // Calculate right edge position for guidelines
      const rightEdgePosition = clip.position + newWidth;
      updatePosition(clip.id, rightEdgePosition);
    } else {
      // Resizing from left edge - position and width both change
      const maxLeftDelta = resizeInfoRef.current.initialWidth - 50; // Prevent width < 50
      const clampedDeltaX = Math.min(maxLeftDelta, deltaX);
      
      const newPosition = resizeInfoRef.current.initialPosition + clampedDeltaX;
      const newWidth = resizeInfoRef.current.initialWidth - clampedDeltaX;
      
      setCurrentPosition(newPosition);
      setCurrentWidth(newWidth);
      
      // Update guidelines with the left edge position
      updatePosition(clip.id, newPosition);
    }
  }, [clip.id, clip.position, updatePosition]);

  const handleGlobalMouseUp = useCallback((e: MouseEvent) => {
    if (!resizeInfoRef.current.isResizing || !resizeInfoRef.current.edge) return;
    
    const deltaX = e.clientX - resizeInfoRef.current.startX;
    let newWidth: number;
    let newPosition: number;
    
    if (resizeInfoRef.current.edge === 'right') {
      // Resizing from right edge
      newWidth = Math.max(50, resizeInfoRef.current.initialWidth + deltaX);
      newPosition = clip.position; // Position doesn't change
      
      // Check for guideline snapping (right edge)
      const rightEdgePosition = newPosition + newWidth;
      const guidelines = document.querySelectorAll('[class*="guideline"]');
      
      guidelines.forEach(guideline => {
        const styleAttr = guideline.getAttribute('style');
        if (styleAttr) {
          const leftMatch = styleAttr.match(/left:\s*(\d+)px/);
          if (leftMatch && leftMatch[1]) {
            const guidelinePosition = parseInt(leftMatch[1]);
            
            // If right edge is close to a guideline, snap to it
            if (Math.abs(rightEdgePosition - guidelinePosition) < 5) {
              newWidth = guidelinePosition - newPosition;
            }
          }
        }
      });
      
      // Final snap to grid
      newWidth = Math.round(newWidth / GRID_SIZE) * GRID_SIZE;
      
      // Dispatch the resize action
      dispatch(
        resizeClip({
          trackId,
          clipId: clip.id,
          newDuration: newWidth
        })
      );
    } else {
      // Resizing from left edge
      const maxLeftDelta = resizeInfoRef.current.initialWidth - 50;
      const clampedDeltaX = Math.min(maxLeftDelta, deltaX);
      
      newPosition = resizeInfoRef.current.initialPosition + clampedDeltaX;
      newWidth = resizeInfoRef.current.initialWidth - clampedDeltaX;
      
      // Check for guideline snapping (left edge)
      const guidelines = document.querySelectorAll('[class*="guideline"]');
      
      guidelines.forEach(guideline => {
        const styleAttr = guideline.getAttribute('style');
        if (styleAttr) {
          const leftMatch = styleAttr.match(/left:\s*(\d+)px/);
          if (leftMatch && leftMatch[1]) {
            const guidelinePosition = parseInt(leftMatch[1]);
            
            // If left edge is close to a guideline, snap to it
            if (Math.abs(newPosition - guidelinePosition) < 5) {
              const positionDelta = guidelinePosition - newPosition;
              newPosition = guidelinePosition;
              newWidth -= positionDelta; // Adjust width to maintain right edge
            }
          }
        }
      });
      
      // Final snap to grid
      const snappedPosition = Math.round(newPosition / GRID_SIZE) * GRID_SIZE;
      const positionDelta = snappedPosition - newPosition;
      newPosition = snappedPosition;
      newWidth -= positionDelta; // Adjust width to maintain right edge
      
      // Dispatch both position and size changes
      dispatch(
        repositionClip({
          trackId,
          clipId: clip.id,
          newPosition
        })
      );
      
      dispatch(
        resizeClip({
          trackId,
          clipId: clip.id,
          newDuration: newWidth
        })
      );
    }
    
    // Update visual state
    setCurrentPosition(newPosition);
    setCurrentWidth(newWidth);
    
    // Reset resize state
    resizeInfoRef.current.isResizing = false;
    setIsResizing(false);
    
    // Stop tracking guidelines
    stopTrackingRef.current();
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [clip.id, clip.position, dispatch, handleGlobalMouseMove, trackId]);

  // Handle mouse movement to detect resize areas
  const handleMouseMove = (e: React.MouseEvent, clipElement: HTMLDivElement | null) => {
    if (!clipElement || resizeInfoRef.current.isResizing) return;

    const rect = clipElement.getBoundingClientRect();
    const isNearRightEdge = e.clientX > rect.right - 10 && e.clientX < rect.right + 5;
    const isNearLeftEdge = e.clientX < rect.left + 10 && e.clientX > rect.left - 5;
    
    if (isNearRightEdge) {
      setCursor('ew-resize');
    } else if (isNearLeftEdge) {
      setCursor('ew-resize');
    } else {
      setCursor('auto');
    }
  };

  // Start resizing on mouse down if near an edge
  const handleMouseDown = (e: React.MouseEvent) => {
    const clipElement = e.currentTarget as HTMLDivElement;
    const rect = clipElement.getBoundingClientRect();
    const isNearRightEdge = e.clientX > rect.right - 10 && e.clientX < rect.right + 5;
    const isNearLeftEdge = e.clientX < rect.left + 10 && e.clientX > rect.left - 5;
    
    if (isNearRightEdge || isNearLeftEdge) {
      e.preventDefault();
      e.stopPropagation();
      
      const edge = isNearRightEdge ? 'right' : 'left';
      
      // Set resize state
      setIsResizing(true);
      
      resizeInfoRef.current = {
        isResizing: true,
        startX: e.clientX,
        initialWidth: clip.duration,
        initialPosition: clip.position,
        edge
      };
      
      // Start tracking for guidelines with the appropriate edge position
      if (edge === 'right') {
        // Track right edge position
        const rightEdgePosition = clip.position + clip.duration;
        startTracking(clip.id, trackId, rightEdgePosition, 1, true);
      } else {
        // Track left edge position
        startTracking(clip.id, trackId, clip.position, 1, true);
      }
      
      // Add global mouse event listeners
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }
  };

  // Handle mouse leave to reset cursor
  const handleMouseLeave = () => {
    if (!resizeInfoRef.current.isResizing) {
      setCursor('auto');
    }
  };

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleGlobalMouseMove, handleGlobalMouseUp]);

  return {
    isResizing,
    cursor,
    currentWidth,
    currentPosition,
    handleMouseMove,
    handleMouseDown,
    handleMouseLeave
  };
}