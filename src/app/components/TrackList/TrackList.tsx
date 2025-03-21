import React, { useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { TrackInterface } from "@/app/features/tracks/trackTypes";
import {
  selectTracks,
  selectTrack,
  createTrack,
  moveClipToTrack,
} from "@/app/store";
import Track from "../Track/Track";
import styles from "./TrackList.module.css";
import {
  GuidelinesProvider,
  Guidelines,
  useGuidelines,
} from "@/app/features/guidelines/guidelines-implementation";
import { ClipHeader } from "@/app/components/Clip/ClipHeader";
import { ClipInterface } from "@/app/features/clips/clipTypes";
import { GRID_SIZE } from "@/app/constants";

// Separate component for the clip header with opacity during drag
function DraggableClipHeader({
  clip,
  trackId,
}: {
  clip: ClipInterface;
  trackId: number;
  onPositionUpdate: (clipId: number, position: number) => void;
  onDragStart: (
    clipId: number,
    trackId: number,
    position: number,
    width: number
  ) => void;
  onDragEnd: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div style={{ opacity: isDragging ? 0.5 : 1 }}>
      <ClipHeader clip={clip} trackId={trackId} />
    </div>
  );
}

// This is the actual TrackList component that uses Guidelines
export default function TrackList() {
  return (
    <GuidelinesProvider>
      <TrackListContent />
    </GuidelinesProvider>
  );
}

// Separate component to access the context inside the provider
function TrackListContent() {
  // Get tracks from Redux store
  const tracks = useSelector(selectTracks);
  const dispatch = useDispatch();

  // Reference to the container for calculating positions
  const containerRef = useRef<HTMLDivElement>(null);

  // Track if we're dragging over empty space
  const [isDraggingOverEmpty, setIsDraggingOverEmpty] = useState(false);

  // Get guidelines functions from context
  const { startTracking, updatePosition, stopTracking } = useGuidelines();

  // Handle track click by dispatching selectTrack action
  const handleTrackClick = (track: TrackInterface) => {
    dispatch(selectTrack(track.trackHeader.id));
  };

  // This component will pass the custom ClipHeader to the Track component
  // In TrackList.tsx
  const renderClipHeader = useCallback(
    (clip: ClipInterface, trackId: number) => {
      return <ClipHeader clip={clip} trackId={trackId} />;
    },
    []
  );

  // Handle drag over the empty space
  const handleEmptySpaceDragOver = (e: React.DragEvent) => {
    // Always prevent default to allow drop
    e.preventDefault();

    // Get all current track elements
    const trackElements = containerRef.current?.querySelectorAll(
      '[class*="trackContainer"]'
    );
    if (!trackElements || !containerRef.current) return;

    // Check if mouse position is below all tracks
    const containerRect = containerRef.current.getBoundingClientRect();
    let isBelowAllTracks = true;

    trackElements.forEach((track) => {
      const trackRect = track.getBoundingClientRect();
      if (e.clientY <= trackRect.bottom) {
        isBelowAllTracks = false;
      }
    });

    // If we're below all tracks and within the container
    if (
      isBelowAllTracks &&
      e.clientY > containerRect.top &&
      e.clientY < containerRect.bottom
    ) {
      setIsDraggingOverEmpty(true);

      // We can't directly get the data during dragOver due to browser security
      // The data will be available in the drop event
    } else {
      setIsDraggingOverEmpty(false);
    }
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    // Only handle if we're leaving the container entirely, not entering a child
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsDraggingOverEmpty(false);
    }
  };

  // Handle dropping a clip on empty space
  const handleEmptySpaceDrop = (e: React.DragEvent) => {
    e.preventDefault();

    // Check if we're below all tracks
    const trackElements = containerRef.current?.querySelectorAll(
      '[class*="trackContainer"]'
    );
    if (!trackElements || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    let isBelowAllTracks = true;

    trackElements.forEach((track) => {
      const trackRect = track.getBoundingClientRect();
      if (e.clientY <= trackRect.bottom) {
        isBelowAllTracks = false;
      }
    });

    // Only process if dropping below all tracks
    if (isBelowAllTracks && isDraggingOverEmpty) {
      // Get data directly from the event
      const clipId = parseInt(e.dataTransfer.getData("clipId"));
      const sourceTrackId = parseInt(e.dataTransfer.getData("sourceTrackId"));
      const offsetX = parseInt(e.dataTransfer.getData("offsetX") || "0");

      console.log("Drop detected with data:", {
        clipId,
        sourceTrackId,
        offsetX,
      });

      if (clipId && sourceTrackId) {
        // Calculate position where the clip was dropped
        const rawPosition = Math.max(
          0,
          e.clientX - containerRect.left - offsetX
        );
        const snappedPosition = Math.round(rawPosition / GRID_SIZE) * GRID_SIZE;

        console.log("Creating new track and moving clip:", {
          clipId,
          sourceTrackId,
          newPosition: snappedPosition,
        });

        // Generate a unique ID for the new track
        const newTrackId = Date.now();

        // Create a new track
        dispatch(
          createTrack({
            id: newTrackId,
            name: `Track ${tracks.length + 1}`,
          })
        );

        // Move the clip to the new track
        dispatch(
          moveClipToTrack({
            sourceTrackId,
            targetTrackId: newTrackId,
            clipId,
            newPosition: snappedPosition,
          })
        );

        // Select the new track
        dispatch(selectTrack(newTrackId));
      }

      // Reset drag state
      setIsDraggingOverEmpty(false);
      stopTracking();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.trackListContainer} ${
        isDraggingOverEmpty ? styles.dragOverEmpty : ""
      }`}
      style={{
        position: "relative",
        minHeight: "300px",
        paddingBottom: "100px",
      }}
      onDragOver={handleEmptySpaceDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleEmptySpaceDrop}
    >
      {tracks.map((track) => (
        <Track
          key={track.trackHeader.id}
          track={track}
          onTrackClick={handleTrackClick}
          renderClipHeader={renderClipHeader}
        />
      ))}

      {/* Empty space drop indicator */}
      {isDraggingOverEmpty && (
        <div className={styles.emptySpaceIndicator}>
          <div className={styles.newTrackPreview}>
            <span>Drop to create new track</span>
          </div>
        </div>
      )}

      {/* Guidelines overlay */}
      <Guidelines />
    </div>
  );
}
