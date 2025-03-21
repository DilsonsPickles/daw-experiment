import React from "react";
import styles from "./MainToolbar.module.css";
import TransportButton from "../Buttons/TransportButton/TransportButton";
import { transportButtons } from "@/app/constants";

function MainToolbar() {
  return (
    <div className={styles.mainToolbarContainer}>
      <div className={styles.transportButtonGroup}>
      {transportButtons.map((transportButton, index) => (
          <TransportButton
            key={index}
            code={transportButton.code}
          />
        ))}
      </div>
    </div>
  );
}

export default MainToolbar;
