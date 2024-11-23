export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image';
  imageUrl?: string;
  roomId: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: number;
}

export type AuthView = 'login' | 'signup';

export interface ChatRoom {
  id: string;
  type: 'private' | 'group';
  name?: string;
  participants: string[];
  createdAt: number;
}