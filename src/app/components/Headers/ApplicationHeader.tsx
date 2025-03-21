import React from "react";
import styles from "./ApplicationHeader.module.css";

function ApplicationHeader() {
  return (
    <div className={styles.applicationHeaderContainer}>
      <div className={styles.tabGroup}>
        <div>Tab 1</div>
        <div>Tab 1</div>
        <div>Tab 1</div>
      </div>
      <div className={styles.windowButtonGroup}>
        <div>_</div>
        <div>[]</div>
        <div>X</div>
      </div>
    </div>
  );
}

export default ApplicationHeader;
