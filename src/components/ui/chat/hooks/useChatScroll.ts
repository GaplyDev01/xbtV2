import { useEffect, useRef } from 'react';
import { Message } from '../types/chat.types';

export const useChatScroll = (messages: Message[]) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return endRef;
};