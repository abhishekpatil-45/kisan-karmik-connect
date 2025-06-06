
import { useState, useCallback } from 'react';
import { Conversation, Message } from '@/types/messaging';

export const useMessagingState = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const updateConversations = useCallback((newConversations: Conversation[]) => {
    setConversations(newConversations);
  }, []);

  const addNewConversation = useCallback((conversation: Conversation) => {
    setConversations(prev => [conversation, ...prev]);
  }, []);

  const addMessageToConversation = useCallback((conversationId: string, message: Message) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          updated_at: new Date().toISOString()
        };
      }
      return conv;
    }));
  }, []);

  const updateMessageReadStatus = useCallback((messageId: string) => {
    const readAt = new Date().toISOString();
    
    setConversations(prev => prev.map(conv => ({
      ...conv,
      messages: conv.messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, read_at: readAt }
          : msg
      )
    })));

    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, read_at: readAt }
        : msg
    ));
  }, []);

  const updateMessagesForActiveConversation = useCallback((conversationId: string | null) => {
    if (conversationId && conversations.length > 0) {
      const activeConvo = conversations.find(c => c.id === conversationId);
      if (activeConvo) {
        setMessages(activeConvo.messages || []);
      }
    } else {
      setMessages([]);
    }
  }, [conversations]);

  return {
    // State
    conversations,
    messages,
    activeConversationId,
    isLoading,
    isSending,
    
    // Setters
    setActiveConversationId,
    setIsLoading,
    setIsSending,
    
    // State updaters
    updateConversations,
    addNewConversation,
    addMessageToConversation,
    updateMessageReadStatus,
    updateMessagesForActiveConversation,
  };
};
