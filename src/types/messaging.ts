
export interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at?: string;
  message_type?: string;
  conversation_id: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  farmer_id: string;
  laborer_id: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
  farmer_profile?: {
    id: string;
    full_name: string;
    role: string;
  };
  laborer_profile?: {
    id: string;
    full_name: string;
    role: string;
  };
}

export interface MessagingContextType {
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  isLoading: boolean;
  isSending: boolean;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  startConversation: (targetUserId: string) => Promise<string | null>;
  loadConversations: () => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
}
