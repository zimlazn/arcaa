export interface UserProfile {
  id: string;
  coupleId?: string;
  displayName: string;
  photoURL?: string;
  mood?: string;
  status?: string;
  lastActive?: any; // Firestore Timestamp
  battery?: number;
}

export interface Couple {
  id: string;
  user1Id: string;
  user2Id?: string | null;
  code: string;
  createdAt: any;
  anniversary?: any;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
  type: 'text' | 'image' | 'video' | 'voice';
  attachmentUrl?: string;
}

export interface Post {
  id: string;
  authorId: string;
  imageUrl: string;
  caption?: string;
  createdAt: any;
  likes: string[]; // User IDs who liked
}

export interface Story {
  id: string;
  authorId: string;
  imageUrl: string;
  createdAt: any;
  expiresAt: any;
}
