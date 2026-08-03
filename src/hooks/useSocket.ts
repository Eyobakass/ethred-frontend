// src/hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { token, user } = useAuthStore();
  const { addMessage, setTypingStatus } = useChatStore();

  useEffect(() => {
    if (!token || !user) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
    });

    socket.on('message:received', (message) => {
      addMessage(message);
    });

    socket.on('typing:start', ({ user_id }) => {
      setTypingStatus(user_id, true);
    });

    socket.on('typing:stop', ({ user_id }) => {
      setTypingStatus(user_id, false);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user, addMessage, setTypingStatus]);

  const joinInquiry = (inquiryId: string) => {
    socketRef.current?.emit('join:inquiry', inquiryId);
  };

  const leaveInquiry = (inquiryId: string) => {
    socketRef.current?.emit('leave:inquiry', inquiryId);
  };

  const sendMessage = (inquiry_id: string, content: string) => {
    socketRef.current?.emit('message:send', { inquiry_id, content });
  };

  const sendTypingStart = (inquiry_id: string) => {
    socketRef.current?.emit('typing:start', { inquiry_id });
  };

  const sendTypingStop = (inquiry_id: string) => {
    socketRef.current?.emit('typing:stop', { inquiry_id });
  };

  return {
    joinInquiry,
    leaveInquiry,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
  };
};
