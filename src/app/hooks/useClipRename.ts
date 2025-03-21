import { useDispatch } from 'react-redux';
import { renameClip } from '@/app/store';
import { ClipInterface } from '@/app/features/clips/clipTypes';

export function useClipRename(clip: ClipInterface, trackId: number) {
  const dispatch = useDispatch();

  /**
   * Handles renaming of a clip
   * @param newName The new name to assign to the clip
   */
  const handleRename = (newName: string) => {
    if (newName === clip.name) return; // Avoid unnecessary dispatches if name hasn't changed
    
    dispatch(
      renameClip({
        trackId,
        clipId: clip.id,
        name: newName,
      })
    );
  };

  return {
    handleRename,
  };
}