export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const createMessage = (content: string, sender: 'user' | 'ai'): Message => {
  return {
    id: generateId(),
    content,
    sender,
    timestamp: Date.now()
  };
};

export const createThread = (userMessage: string): Thread => {
  const message = createMessage(userMessage, 'user');
  const id = generateId();
  
  return {
    id,
    title: userMessage.length > 30 ? `${userMessage.substring(0, 30)}...` : userMessage,
    messages: [message],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isRead: true
  };
};