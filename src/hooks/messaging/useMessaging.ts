
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MessagingApi } from './messagingApi';
import { useMessagingState } from './messagingState';

export const useMessaging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    conversations,
    messages,
    activeConversationId,
    isLoading,
    isSending,
    setActiveConversationId,
    setIsLoading,
    setIsSending,
    updateConversations,
    addNewConversation,
    addMessageToConversation,
    updateMessageReadStatus,
    updateMessagesForActiveConversation,
  } = useMessagingState();

  const startConversation = async (targetUserId: string): Promise<string | null> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to start a conversation',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setIsLoading(true);
      const conversationId = await MessagingApi.startConversation(user.id, targetUserId);
      
      if (conversationId) {
        setActiveConversationId(conversationId);
        // Reload conversations to get the new one
        await loadConversations();
      }

      return conversationId;
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create conversation',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user || !content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSending(true);
      const message = await MessagingApi.sendMessage(conversationId, content);
      
      addMessageToConversation(conversationId, message);

      if (activeConversationId === conversationId) {
        updateMessagesForActiveConversation(conversationId);
      }

      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const loadConversations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const loadedConversations = await MessagingApi.loadConversations();
      updateConversations(loadedConversations);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      await MessagingApi.markAsRead(messageId);
      updateMessageReadStatus(messageId);
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      // Don't show toast for this error as it's not critical
    }
  };

  // Update messages when active conversation changes
  useEffect(() => {
    updateMessagesForActiveConversation(activeConversationId);
  }, [activeConversationId, updateMessagesForActiveConversation]);

  // Load conversations when user changes
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      updateConversations([]);
      setActiveConversationId(null);
    }
  }, [user]);

  return {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    isLoading,
    isSending,
    sendMessage,
    startConversation,
    loadConversations,
    markAsRead,
  };
};
