import React, { ReactNode } from 'react'
import styles from './Viewport.module.css'

interface ViewportProps {
  children?: ReactNode;
}

function Viewport({ children }: ViewportProps) {
  return (
    <div className={styles.viewportContainer}>
      {children}
    </div>
  )
}

export default Viewport