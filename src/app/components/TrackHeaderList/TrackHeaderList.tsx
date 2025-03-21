import { useDispatch } from "react-redux";
import { removeTrack, renameTrack } from "../../store";
import { TrackInterface, TrackHeaderInterface } from "@/app/features/tracks/trackTypes";
import TrackHeader from "../Headers/TrackHeader";
import styles from "./TrackHeaderList.module.css";

interface TrackHeaderListProps {
  tracks: TrackInterface[];
  trackHeaderClick: (trackHeader: TrackHeaderInterface) => void;
}

export default function TrackHeaderList({
  tracks,
  trackHeaderClick,
}: TrackHeaderListProps) {
  const dispatch = useDispatch();

  return (
    <div className={styles.trackHeaderListContainer}>
      {tracks.map((track) => (
        <TrackHeader 
          key={track.trackHeader.id}
          trackHeader={track.trackHeader}
          onClick={() => trackHeaderClick(track.trackHeader)}
          onRename={(name: string) => dispatch(renameTrack({ id: track.trackHeader.id, name }))}
          onRemove={() => dispatch(removeTrack(track.trackHeader.id))}
        />
      ))}
    </div>
  );
}