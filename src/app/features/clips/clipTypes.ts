// features/clips/clipTypes.ts
export interface ClipInterface {
    id: number;
    name: string;
    color: string;
    position: number;
    duration: number
  }
  
  export interface RenameClipPayload {
    trackId: number;
    clipId: number;
    name: string;
  }