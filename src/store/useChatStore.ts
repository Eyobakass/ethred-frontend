// src/store/useChatStore.ts
import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  inquiry_id: string;
  sender_id: string;
  content: string;
  timestamp: string;
}

interface ChatStore {
  activeInquiryId: string | null;
  messages: ChatMessage[];
  typingUsers: Record<string, boolean>;
  setActiveInquiryId: (inquiryId: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setTypingStatus: (userId: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeInquiryId: null,
  messages: [],
  typingUsers: {},
  setActiveInquiryId: (inquiryId) => set({ activeInquiryId: inquiryId, messages: [] }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setTypingStatus: (userId, isTyping) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: isTyping },
    })),
}));
