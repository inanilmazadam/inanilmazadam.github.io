export type ShotType = '3pt' | 'freethrow' | 'floater' | 'layup' | 'midrange';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  type: ShotType;
  totalShots: number;
  madeShots: number;
  accuracy: number;
  timestamp: string;
}

export interface Shot {
  id: string;
  sessionId: string;
  userId: string;
  isMade: boolean;
  location: { x: number; y: number };
  timestamp: string;
}
