import { TrackInterface } from "@/app/features/tracks/trackTypes";
import { ClipInterface } from "@/app/features/clips/clipTypes";
import Clip from "../Clip/Clip";
import styles from "./Track.module.css";
import { useDispatch, useSelector } from "react-redux";
import { moveClipToTrack, repositionClip } from "../../store";
import { useState, useEffect, useRef } from "react";
import { selectSelectedTrackId } from "@/app/store";
import { GRID_SIZE } from "@/app/constants";

interface TrackProps {
  track: TrackInterface;
  onTrackClick?: (track: TrackInterface) => void;
  onClipClick?: (clip: ClipInterface, trackId: number) => void;
  renderClipHeader?: (clip: ClipInterface, trackId: number) => React.ReactNode;
}

function Track({ track, onTrackClick, renderClipHeader }: TrackProps) {
  const { trackHeader, clips } = track;
  const dispatch = useDispatch();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const selectedTrackId = useSelector(selectSelectedTrackId);
  const isSelected = selectedTrackId === trackHeader.id;

  useEffect(() => {
    if (clips.length > 0 && trackRef.current) {
      const maxRight = Math.max(...clips.map((clip) => clip.position + clip.duration));
      trackRef.current.style.minWidth = `${maxRight + 100}px`; // Add some extra space
    }
  }, [clips]);

  const handleTrackClick = () => {
    if (onTrackClick) {
      onTrackClick(track);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow dropping
    
    // Make sure we're dragging a clip, not something else
    const clipId = e.dataTransfer.getData("clipId");
    if (clipId || e.dataTransfer.types.includes("clipId")) {
      setIsDragOver(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    // Make sure we're dragging a clip, not something else
    if (e.dataTransfer.types.includes("clipId")) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only consider it a leave if we're not entering a child element
    if (!trackRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const clipId = parseInt(e.dataTransfer.getData("clipId"));
    const sourceTrackId = parseInt(e.dataTransfer.getData("sourceTrackId"));
    const offsetX = parseInt(e.dataTransfer.getData("offsetX") || "0");
  
    if (isNaN(clipId) || isNaN(sourceTrackId)) return;
    
    // Calculate position where the clip was dropped
    const trackRect = trackRef.current?.getBoundingClientRect();
    if (!trackRect) return;
    
    const rawPosition = Math.max(0, e.clientX - trackRect.left - offsetX);
    const snappedPosition = Math.round(rawPosition / GRID_SIZE) * GRID_SIZE;
  
    // If same track, just reposition
    if (sourceTrackId === trackHeader.id) {
      dispatch(
        repositionClip({
          trackId: trackHeader.id,
          clipId,
          newPosition: snappedPosition,
        })
      );
    } else {
      // Move between tracks
      dispatch(
        moveClipToTrack({
          sourceTrackId,
          targetTrackId: trackHeader.id,
          clipId,
          newPosition: snappedPosition,
        })
      );
    }
  };

  const renderClips = () => {
    if (clips.length === 0) {
      return null;
    }

    return clips.map((clip) => (
      <Clip
        key={`track-${trackHeader.id}-clip-${clip.id}`}
        clip={clip}
        trackId={trackHeader.id}
        clipHeader={
          renderClipHeader ? renderClipHeader(clip, trackHeader.id) : undefined
        }
      />
    ));
  };

  return (
    <div
      ref={trackRef}
      className={`${styles.trackContainer} ${
        isSelected ? styles.selected : ""
      } ${isDragOver ? styles.dragTarget : ""}`}
      onClick={handleTrackClick}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ position: "relative" }}
    >
      {renderClips()}
    </div>
  );
}

export default Track;