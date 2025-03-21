import { TrackInterface } from "@/app/features/tracks/trackTypes";
import { ClipInterface } from "@/app/features/clips/clipTypes";
import Clip from "../Clip/Clip";
import styles from "./Track.module.css";
import { useDispatch, useSelector } from "react-redux";
import { moveClipToTrack, repositionClip } from "../../store";
import { useEffect, useRef } from "react";
import { selectSelectedTrackId } from "@/app/store";
import { GRID_SIZE } from "@/app/constants";
import { useClipMove } from "@/app/hooks/useClipMove";

interface TrackProps {
  track: TrackInterface;
  onTrackClick?: (track: TrackInterface) => void;
  onClipClick?: (clip: ClipInterface, trackId: number) => void;
  renderClipHeader?: (clip: ClipInterface, trackId: number) => React.ReactNode;
}

function Track({ track, onTrackClick, renderClipHeader }: TrackProps) {
  const { trackHeader, clips } = track;
  const dispatch = useDispatch();

  const dummyClip = clips[0] || {
    id: -1,
    name: "",
    position: 0,
    duration: 0,
    color: "",
  };

  const { handleDrop } = useClipMove(dummyClip, trackHeader.id);

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
      }`}
      onClick={handleTrackClick}
      onDragOver={(e) => e.preventDefault()} // Allow dropping
      onDrop={(e) => handleDrop(e, trackHeader.id)} // Use the hook's handleDrop
      style={{ position: "relative" }}
    >
      {renderClips()}
    </div>
  );
}

export default Track;
