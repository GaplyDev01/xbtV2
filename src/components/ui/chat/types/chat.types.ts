export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isRead: boolean;
}

export interface ChatState {
  threads: Thread[];
  currentThreadId: string | null;
  isProcessing: boolean;
}

export interface ChatActions {
  sendMessage: (message: string, isNewThread: boolean) => Promise<void>;
  selectThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
}