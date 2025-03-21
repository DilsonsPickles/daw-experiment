import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectClip,
  selectSelectedClipId,
  selectSelectedTrackId,
} from "../../store";
import { useClipResize } from "@/app/hooks/useClipResize";
import { ClipHeader } from "./ClipHeader";
import { ClipInterface } from "@/app/features/clips/clipTypes";

type ClipProps = {
  clip: ClipInterface;
  trackId: number;
  clipHeader?: React.ReactNode;
}

export default function Clip({ clip, trackId, clipHeader }: ClipProps) {
  const dispatch = useDispatch();
  const clipRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Get selection state from Redux
  const selectedTrackId = useSelector(selectSelectedTrackId);
  const selectedClipId = useSelector(selectSelectedClipId);
  const isSelected = selectedTrackId === trackId && selectedClipId === clip.id;

  // Use our custom hook for resize functionality
  const {
    isResizing,
    cursor,
    currentWidth,
    currentPosition,
    handleMouseMove,
    handleMouseDown,
    handleMouseLeave,
  } = useClipResize(clip, trackId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(selectClip({ trackId, clipId: clip.id }));
  };

  // Add handlers for drag start and end
  const handleDragStartOpacity = () => {
    setIsDragging(true);
  };

  const handleDragEndOpacity = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={clipRef}
      id={`clip-${clip.id}`}
      data-clip-id={clip.id}
      tabIndex={0}
      style={{
        backgroundColor: clip.color || "#cccccc",
        boxShadow: isSelected ? "0 0 0 2px #2196f3" : "none",
        border: isSelected ? "1px solid black" : "1px solid #e0e0e0",
        transition: isResizing ? "none" : "transform 0.1s, box-shadow 0.1s",
        borderRadius: "3px",
        padding: "4px",
        position: "absolute",
        left: `${isResizing ? currentPosition : clip.position}px`,
        width: `${isResizing ? currentWidth : clip.duration}px`,
        height: "100%",
        cursor: cursor,
        opacity: isDragging ? 0.5 : 1, // Make transparent when dragging
      }}
      onMouseMove={(e) => handleMouseMove(e, clipRef.current)}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {clipHeader ? 
        // Pass the clipHeader as is - it should already have guideline handlers
        clipHeader 
        : 
        // Use the default ClipHeader with drag handlers for opacity
        <ClipHeader 
          clip={clip} 
          trackId={trackId}
          onDragStart={(clipId, trackId, position, width) => {
            handleDragStartOpacity();
          }}
          onDragEnd={() => {
            handleDragEndOpacity();
          }}
        />
      }
    </div>
  );
}