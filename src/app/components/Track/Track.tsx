import { TrackInterface } from "@/app/features/tracks/trackTypes";
import { ClipInterface } from "@/app/features/clips/clipTypes";
import Clip from "../Clip/Clip";
import styles from "./Track.module.css";
import { useDispatch, useSelector } from "react-redux";
import { moveClipToTrack, repositionClip } from "../../store";
import { useEffect, useRef } from "react";
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

  const selectedTrackId = useSelector(selectSelectedTrackId);
  const isSelected = selectedTrackId === trackHeader.id;

  useEffect(() => {
    if (clips.length > 0 && trackRef.current) {
      const maxRight = Math.max(...clips.map((clip) => clip.position + 240));
      trackRef.current.style.minWidth = `${maxRight}px`;
    }
  }, [clips]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow dropping
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const clipId = parseInt(e.dataTransfer.getData("clipId"));
    const sourceTrackId = parseInt(e.dataTransfer.getData("sourceTrackId"));
    const offsetX = parseInt(e.dataTransfer.getData("offsetX") || "0");
  
    // Calculate the raw position where the clip was dropped
    const trackRect = e.currentTarget.getBoundingClientRect();
    const rawPosition = Math.max(0, e.clientX - trackRect.left - offsetX);
    
    // Snap to grid
    const snappedPosition = Math.round(rawPosition / GRID_SIZE) * GRID_SIZE;
  
    // If it's the same track, reposition the clip
    if (sourceTrackId === trackHeader.id) {
      dispatch(
        repositionClip({
          trackId: trackHeader.id,
          clipId,
          newPosition: snappedPosition,
        })
      );
    } else {
      // Moving between tracks
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

  const handleTrackClick = () => {
    if (onTrackClick) {
      onTrackClick(track);
    }
  };

  const renderClips = () => {
    if (clips.length === 0) {
      return;
    }

    return clips.map((clip) => (
      <Clip
        key={`track-${trackHeader.id}-clip-${clip.id}`}
        clip={clip}
        trackId={trackHeader.id}
        clipHeader={renderClipHeader ? renderClipHeader(clip, trackHeader.id) : undefined}
      />
    ));
  };

  return (
    <div
      ref={trackRef}
      className={`${styles.trackContainer} ${isSelected ? styles.selected : ""}`}
      onClick={handleTrackClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ position: "relative" }}
    >
      {renderClips()}
    </div>
  );
}

export default Track;