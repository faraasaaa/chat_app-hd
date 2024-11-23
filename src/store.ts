import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Message, User, ChatRoom } from './types';
import { subDays } from 'date-fns';

interface ChatStore {
  messages: Message[];
  users: User[];
  currentUser: User | null;
  rooms: ChatRoom[];
  currentRoom: string | null;
  addMessage: (content: string, type: 'text' | 'image', imageUrl?: string) => void;
  registerUser: (username: string, password: string) => { success: boolean; error?: string };
  loginUser: (username: string, password: string) => { success: boolean; error?: string };
  logoutUser: () => void;
  initialize: () => void;
  createRoom: (type: 'private' | 'group', participants: string[], name?: string) => void;
  setCurrentRoom: (roomId: string | null) => void;
  getRoomMessages: (roomId: string) => Message[];
}

const STORAGE_KEY = 'temp-chat-data';
const USERS_KEY = 'temp-chat-users';
const ROOMS_KEY = 'temp-chat-rooms';

export const useStore = create<ChatStore>((set, get) => ({
  messages: [],
  users: [],
  currentUser: null,
  rooms: [],
  currentRoom: null,

  initialize: () => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    const storedUsers = localStorage.getItem(USERS_KEY);
    const storedRooms = localStorage.getItem(ROOMS_KEY);
    
    if (storedData) {
      const { messages } = JSON.parse(storedData);
      const now = Date.now();
      const threeDaysAgo = subDays(now, 3).getTime();
      const validMessages = messages.filter((m: Message) => m.timestamp > threeDaysAgo);
      set({ messages: validMessages });
    }

    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      set({ users });
    }

    if (storedRooms) {
      const rooms = JSON.parse(storedRooms);
      set({ rooms });
    }
  },

  registerUser: (username, password) => {
    const { users } = get();
    
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: 'Username already exists' };
    }

    const newUser: User = {
      id: nanoid(),
      username,
      password, // In a real app, this would be hashed
      createdAt: Date.now()
    };

    const updatedUsers = [...users, newUser];
    set({ users: updatedUsers });
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    
    return { success: true };
  },

  loginUser: (username, password) => {
    const { users } = get();
    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    set({ currentUser: user });
    return { success: true };
  },

  logoutUser: () => {
    set({ currentUser: null });
  },

  addMessage: (content, type, imageUrl) => {
    const { messages, currentUser, currentRoom } = get();
    if (!currentUser || !currentRoom) return;

    const newMessage: Message = {
      id: nanoid(),
      sender: currentUser.username,
      content,
      timestamp: Date.now(),
      type,
      imageUrl,
      roomId: currentRoom
    };

    const updatedMessages = [...messages, newMessage];
    set({ messages: updatedMessages });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: updatedMessages }));
  },

  createRoom: (type, participants, name) => {
    const { rooms, currentUser } = get();
    if (!currentUser) return;

    // For private chats, check if room already exists
    if (type === 'private') {
      const existingRoom = rooms.find(
        r => r.type === 'private' && 
        r.participants.length === 2 &&
        r.participants.includes(currentUser.id) &&
        r.participants.includes(participants[0])
      );
      
      if (existingRoom) {
        set({ currentRoom: existingRoom.id });
        return;
      }
    }

    const newRoom: ChatRoom = {
      id: nanoid(),
      type,
      name: name || undefined,
      participants: [currentUser.id, ...participants],
      createdAt: Date.now()
    };

    const updatedRooms = [...rooms, newRoom];
    set({ rooms: updatedRooms, currentRoom: newRoom.id });
    localStorage.setItem(ROOMS_KEY, JSON.stringify(updatedRooms));
  },

  setCurrentRoom: (roomId) => {
    set({ currentRoom: roomId });
  },

  getRoomMessages: (roomId) => {
    const { messages } = get();
    return messages.filter(m => m.roomId === roomId);
  }
}));