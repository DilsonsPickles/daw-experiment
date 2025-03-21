import { TrackHeaderInterface } from "@/app/features/tracks/trackTypes";
import { useDispatch, useSelector } from "react-redux";
import {
  addClip,
  moveTrack,
  selectTracks,
  selectSelectedTrackId,
  selectTrack,
} from "@/app/store";
import styles from "./TrackHeader.module.css";

interface TrackHeaderProps {
  trackHeader: TrackHeaderInterface;
  onClick: () => void;
  onRename: (name: string) => void;
  onRemove: () => void;
}

export default function TrackHeader({
  trackHeader,
  onClick,
  onRename,
  onRemove,
}: TrackHeaderProps) {
  const { name, id, volume, pan } = trackHeader;
  const dispatch = useDispatch();

  // Get all tracks to determine the current index
  const tracks = useSelector(selectTracks);

  // Get the selected track ID to determine if this track is selected
  const selectedTrackId = useSelector(selectSelectedTrackId);
  const isSelected = selectedTrackId === id;

  // Handle selection when track is clicked
  const handleClick = () => {
    dispatch(selectTrack(id));
    onClick(); // Call the original onClick handler
  };

  // Store the ID of the track being dragged
  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("trackId", id.toString());
  };

  // Allow drop by preventing the default behavior
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle the drop event to reorder tracks
  const handleDrop = (e: React.DragEvent, dropTargetId: number) => {
    e.preventDefault();
    const draggedTrackId = parseInt(e.dataTransfer.getData("trackId"));

    if (draggedTrackId !== dropTargetId) {
      // Use the tracks variable already defined at the top level
      const dropTargetIndex = tracks.findIndex(
        (track) => track.trackHeader.id === dropTargetId
      );

      dispatch(
        moveTrack({
          trackId: draggedTrackId,
          newIndex: dropTargetIndex,
        })
      );
    }
  };

  const handleAddClip = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Adding clip to track:", id);
    try {
      dispatch(
        addClip({
          trackId: id,
          clip: {
            color: "#3498db",
          },
        })
      );
    } catch (error) {
      console.error("Error dispatching addClip:", error);
    }
  };

  return (
    <div
      className={`${styles.trackHeaderContainer} ${
        isSelected && styles.selected
      }`}
      draggable={true}
      onDragStart={(e) => handleDragStart(e, trackHeader.id)}
      onDragOver={(e) => handleDragOver(e)}
      onDrop={(e) => handleDrop(e, trackHeader.id)}
      onClick={handleClick}
      style={{
        padding: "8px",
      }}
    >
      <div>
        <div className={styles.trackHeaderHeader}>
          <input
            type="text"
            defaultValue={name}
            // Only update when focus leaves the input
            onBlur={(e) => onRename((e.target as HTMLInputElement).value)}
            // Also update when Enter is pressed
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onRename((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).blur();
              }
            }}
            onClick={(e) => e.stopPropagation()} // Prevent triggering parent click
          />
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the li click event
              onRemove();
            }}
          >
            Remove
          </button>
        </div>

        <div className={styles.trackHeaderControls}>
          <div>Vol:{volume}</div>
          <div>Pan:{pan}</div>
          <div>M</div>
          <div>S</div>
        </div>

        <button
          onClick={(e) => {
            handleAddClip(e);
          }}
        >
          Add Clip
        </button>
      </div>
    </div>
  );
}
