import { useDispatch } from 'react-redux';
import { removeClipFromTrack } from '@/app/store';
import { ClipInterface } from '@/app/features/clips/clipTypes';

/**
 * Custom hook to handle clip removal functionality
 * @param clip The clip to be removed
 * @param trackId The ID of the track containing the clip
 * @returns Object containing the remove handler function
 */
export function useClipRemove(clip: ClipInterface, trackId: number) {
  const dispatch = useDispatch();

  /**
   * Handles removal of a clip from a track
   * @param e The mouse event (to stop propagation)
   */
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    dispatch(
      removeClipFromTrack({
        trackId,
        clipId: clip.id,
      })
    );
  };

  return {
    handleRemove,
  };
}