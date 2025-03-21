import React, { ReactNode } from "react";
import styles from "./TrackHeadersPanel.module.css";
import { useDispatch } from "react-redux";
import { addTrack } from "../../store";

interface TrackHeadersPanelProps {
  children?: ReactNode;
}

function TrackHeadersPanel({ children }: TrackHeadersPanelProps) {
  const dispatch = useDispatch();

  return (
    <div className={styles.trackHeadersPanelContainer}>
      <div className={styles.trackHeadersPanelHeader}>
        <div>Tracks</div>
        <div>
          <button onClick={() => dispatch(addTrack("Mono"))}>Add new track</button>
         
        </div>
      </div>

      {children}
    </div>
  );
}

export default TrackHeadersPanel;
