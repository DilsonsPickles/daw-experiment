import React, { useRef } from "react";
import { ClipInterface } from "@/app/features/clips/clipTypes";
import { useClipRename } from "@/app/hooks/useClipRename";
import { useClipRemove } from "@/app/hooks/useClipRemove";
import { useDispatch } from "react-redux";
import { repositionClip } from "@/app/store";

// Main gridline size in pixels (matching the 140px from your canvas)
const MAJOR_GRID_SIZE = 140;
// Small gridline size (14px from your canvas)
const MINOR_GRID_SIZE = 14;

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
  const offsetXRef = useRef<number>(0);
  const dispatch = useDispatch();

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();

    const clipElement = e.currentTarget.closest("[data-clip-id]");
    if (!clipElement) return;

    // Add opacity to the parent clip
    if (clipElement) {
      (clipElement as HTMLElement).style.opacity = '0.5';
    }

    // Calculate the offset from the left edge of the clip
    const rect = clipElement.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;

    // Store offset for use during drag
    offsetXRef.current = offsetX;

    // Use the offset as the x-coordinate for setDragImage
    e.dataTransfer.setDragImage(clipElement, offsetX, 0);

    e.dataTransfer.setData("clipId", clip.id.toString());
    e.dataTransfer.setData("sourceTrackId", trackId.toString());
    e.dataTransfer.setData("offsetX", offsetX.toString());

    // Notify guideline system
    if (onDragStart) {
      onDragStart(clip.id, trackId, clip.position, clip.duration);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    if (e.clientX === 0) return; // Skip invalid drag events

    const trackElement = e.currentTarget.closest('[class*="trackContainer"]');
    if (!trackElement) return;

    const trackRect = trackElement.getBoundingClientRect();
    const offsetX = offsetXRef.current;

    // Calculate new clip position based on cursor position and drag offset
    const newPosition = Math.max(0, e.clientX - trackRect.left - offsetX);

    // Notify guideline system about position change
    if (onPositionUpdate) {
      onPositionUpdate(clip.id, newPosition);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset opacity
    const clipElement = e.currentTarget.closest("[data-clip-id]");
    if (clipElement) {
      (clipElement as HTMLElement).style.opacity = '1';
    }

    // Always make sure to clear guidelines, even if drop occurs outside a valid target
    if (onDragEnd) {
      onDragEnd();
    }
  };

  return (
    <div
      ref={clipRef}
      style={{ display: "flex", justifyContent: "space-between" }}
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
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