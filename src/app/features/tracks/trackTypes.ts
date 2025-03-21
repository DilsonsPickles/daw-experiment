// features/tracks/trackTypes.ts
export interface TrackHeaderInterface {
    name: string;
    id: number;
    type: string;
    volume: number;
    pan: number;
    mute: boolean;
    solo: boolean;
  }
  
  export interface TrackInterface {
    trackHeader: TrackHeaderInterface;
    clips: ClipInterface[];
  }
  
  export interface RenameTrackPayload {
    id: number;
    name: string;
  }
  
  // Need to reference from clips
  import { ClipInterface } from "../clips/clipTypes";