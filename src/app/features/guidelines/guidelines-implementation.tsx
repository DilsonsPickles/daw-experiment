import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectTracks } from "@/app/store";
import styles from "./guidelines-implementation.module.css";

// Define guideline interface
interface Guideline {
  position: number;
  type: "start" | "end" | "grid";
}

// Define drag state interface
interface DragState {
  isDragging: boolean;
  clipId: number | null;
  trackId: number | null;
  position: number;
  width: number;
  isResizing: boolean;
}

// Create initial state
const initialDragState: DragState = {
  isDragging: false,
  clipId: null,
  trackId: null,
  position: 0,
  width: 0,
  isResizing: false,
};

// Create a context to share state between components
export const GuidelinesContext = React.createContext({
  dragState: initialDragState,
  startTracking: (
    clipId: number,
    trackId: number,
    position: number,
    width: number,
    isResizing?: boolean
  ) => {},
  updatePosition: (clipId: number, position: number) => {},
  stopTracking: () => {},
});

// Main gridline size in pixels (matching the 140px from your canvas)
const MAJOR_GRID_SIZE = 140;

// Component to manage and display guidelines during clip dragging
export function Guidelines() {
  // Get all tracks data from Redux
  const tracks = useSelector(selectTracks);

  // Access the shared drag state
  const { dragState } = React.useContext(GuidelinesContext);

  // State for active guidelines
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);

  // Ref to track mounted state
  const isMounted = useRef(true);

  // Track the previous drag state to prevent unnecessary updates
  const prevDragStateRef = useRef<DragState>({ ...initialDragState });

  // Set mounted state on mount/unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Calculate guidelines whenever drag position changes
  useEffect(() => {
    // Skip if state hasn't really changed
    if (
      prevDragStateRef.current.position === dragState.position &&
      prevDragStateRef.current.isDragging === dragState.isDragging &&
      prevDragStateRef.current.clipId === dragState.clipId
    ) {
      return;
    }

    // Update the previous state ref
    prevDragStateRef.current = { ...dragState };

    // Clear guidelines if not dragging
    if (!dragState.isDragging || dragState.clipId === null) {
      setGuidelines([]);
      return;
    }

    // Get the edge position we're tracking
    const edgePosition = dragState.position;

    const newGuidelines: Guideline[] = [];
    const threshold = 10; // Distance threshold for showing guidelines

    // Check all clips for potential guidelines
    tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        // Skip the dragged clip itself
        if (
          clip.id === dragState.clipId &&
          track.trackHeader.id === dragState.trackId
        )
          return;

        const clipStart = clip.position;
        const clipEnd = clip.position + clip.duration;

        // Check the current edge against other clip edges
        if (Math.abs(edgePosition - clipStart) < threshold) {
          newGuidelines.push({ position: clipStart, type: "start" });
        }

        if (Math.abs(edgePosition - clipEnd) < threshold) {
          newGuidelines.push({ position: clipEnd, type: "end" });
        }
      });
    });

    // Check for major gridlines
    const nearestGridline =
      Math.round(edgePosition / MAJOR_GRID_SIZE) * MAJOR_GRID_SIZE;

    // If we're close to the grid line, add a guideline
    if (Math.abs(edgePosition - nearestGridline) < threshold) {
      newGuidelines.push({ position: nearestGridline, type: "grid" });
    }

    // Only update if still mounted
    if (isMounted.current) {
      setGuidelines(newGuidelines);
    }
  }, [
    dragState.clipId,
    dragState.isDragging,
    dragState.position,
    dragState.trackId,
    dragState.isResizing,
    tracks,
  ]);

  // Render guidelines
  if (!dragState.isDragging || guidelines.length === 0) {
    return null;
  }

  return (
    <div className={styles.guidelinesContainer}>
      {guidelines.map((guideline, index) => (
        <div
          key={`guideline-${index}`}
          className={`${styles.guideline} ${styles[guideline.type]}`}
          style={{
            left: `${guideline.position}px`,
          }}
          data-position={guideline.position}
        />
      ))}
    </div>
  );
}

// Provider component for the guidelines system
export function GuidelinesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use state to track drag info
  const [dragState, setDragState] = useState<DragState>(initialDragState);

  // Memoize functions to prevent recreation on each render
  const startTracking = useCallback(
    (
      clipId: number,
      trackId: number,
      position: number,
      width: number,
      isResizing = false
    ) => {
      setDragState({
        isDragging: true,
        clipId,
        trackId,
        position,
        width,
        isResizing,
      });
    },
    []
  );

  const updatePosition = useCallback((clipId: number, newPosition: number) => {
    setDragState((prev) => {
      // Only update if the clipId matches
      if (prev.clipId !== clipId) return prev;

      return {
        ...prev,
        position: newPosition,
      };
    });
  }, []);

  const stopTracking = useCallback(() => {
    setDragState(initialDragState);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      dragState,
      startTracking,
      updatePosition,
      stopTracking,
    }),
    [dragState, startTracking, updatePosition, stopTracking]
  );

  return (
    <GuidelinesContext.Provider value={contextValue}>
      {children}
    </GuidelinesContext.Provider>
  );
}

// Hook to access guidelines functionality
export const useGuidelines = () => {
  return React.useContext(GuidelinesContext);
};
