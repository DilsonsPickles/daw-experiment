import React, { useRef } from "react";
import { ClipInterface } from "@/app/features/clips/clipTypes";
import { useClipRename } from "@/app/hooks/useClipRename";
import { useClipRemove } from "@/app/hooks/useClipRemove";
import { useClipMove } from "@/app/hooks/useClipMove";

type ClipHeaderProps = {
  clip: ClipInterface;
  trackId: number;
  onPositionUpdate?: (clipId: number, position: number) => void;
  onDragStart?: (
    clipId: number,
    trackId: number,
    position: number,
    width: number
  ) => void;
  onDragEnd?: () => void;
};

export function ClipHeader({
  clip,
  trackId,
  onPositionUpdate,
  onDragStart,
  onDragEnd,
}: ClipHeaderProps) {
  const { handleRename } = useClipRename(clip, trackId);
  const { handleRemove } = useClipRemove(clip, trackId);
  const clipRef = useRef<HTMLDivElement>(null);
  
  // Use our new hook for moving clips
  const { handleDragStart, handleDrag, handleDragEnd } = useClipMove(
    clip, 
    trackId, 
    onPositionUpdate, 
    onDragStart, 
    onDragEnd
  );

  return (
    <div
      ref={clipRef}
      style={{ display: "flex", justifyContent: "space-between" }}
      draggable
      onDragStart={(e) => {
        handleDragStart(e);
        // Add opacity to the parent clip
        const clipElement = e.currentTarget.closest("[data-clip-id]");
        if (clipElement) {
          (clipElement as HTMLElement).style.opacity = '0.5';
        }
      }}
      onDrag={handleDrag}
      onDragEnd={(e) => {
        handleDragEnd(e);
        // Reset opacity
        const clipElement = e.currentTarget.closest("[data-clip-id]");
        if (clipElement) {
          (clipElement as HTMLElement).style.opacity = '1';
        }
      }}
    >
      <input
        style={{ width: "100%" }}
        type="text"
        defaultValue={clip.name}
        onBlur={(e) => handleRename((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleRename((e.target as HTMLInputElement).value);
            (e.target as HTMLInputElement).blur();
          }
        }}
        onClick={(e) => e.stopPropagation()}
      />
      <button onClick={handleRemove}>X</button>
    </div>
  );
}