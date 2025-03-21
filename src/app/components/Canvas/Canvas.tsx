import React, { ReactNode, useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectTracks } from '@/app/store';
import styles from './Canvas.module.css';

interface CanvasProps {
  children?: ReactNode;
}

function Canvas({ children }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(1200);
  const tracks = useSelector(selectTracks);
  
  // Calculate required width based on tracks and clips
  useEffect(() => {
    if (canvasRef.current) {
      // Start with default minimum width
      let requiredWidth = 1200;
      
      // Find the rightmost clip across all tracks
      tracks.forEach(track => {
        track.clips.forEach(clip => {
          const clipRight = clip.position + clip.duration;
          requiredWidth = Math.max(requiredWidth, clipRight + 100); // Add some padding
        });
      });
      
      // Set canvas width to the maximum of current width, content width, and required width
      const contentWidth = canvasRef.current.scrollWidth;
      setCanvasWidth(Math.max(requiredWidth, contentWidth));
      
      // Set up observer for container size changes
      const resizeObserver = new ResizeObserver((entries) => {
        const newContentWidth = entries[0].contentRect.width;
        setCanvasWidth(width => Math.max(width, newContentWidth));
      });
      
      resizeObserver.observe(canvasRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [tracks]); // Re-run when tracks change

  return (
    <div 
      ref={canvasRef} 
      className={styles.canvasContainer}
      style={{
        backgroundSize: `14px 14px, 140px 140px`,
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
        `,
        backgroundPosition: '0 0',
        width: `${canvasWidth}px`
      }}
    >
      {children}
    </div>
  );
}

export default Canvas;