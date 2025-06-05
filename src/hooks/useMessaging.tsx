
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at?: string;
  message_type?: string;
}

interface Conversation {
  id: string;
  farmer_id: string;
  laborer_id: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export const useMessaging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // SECURITY FIX: Enhanced message sending with proper authentication
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
      
      // SECURITY FIX: Get current session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      // SECURITY FIX: Input validation and sanitization
      const trimmedContent = content.trim();
      if (trimmedContent.length === 0) {
        throw new Error('Message cannot be empty');
      }

      if (trimmedContent.length > 5000) {
        throw new Error('Message too long (max 5000 characters)');
      }

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabase.supabaseKey,
        },
        body: JSON.stringify({
          action: 'sendMessage',
          data: {
            conversation_id: conversationId,
            content: trimmedContent,
            message_type: 'text'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const result = await response.json();
      
      // Update local state with new message
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, result.message],
            updated_at: new Date().toISOString()
          };
        }
        return conv;
      }));

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

  // SECURITY FIX: Enhanced conversation loading with proper error handling
  const loadConversations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // SECURITY FIX: Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabase.supabaseKey,
        },
        body: JSON.stringify({
          action: 'getConversations'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load conversations');
      }

      const result = await response.json();
      
      // SECURITY FIX: Validate response data structure
      if (result.conversations && Array.isArray(result.conversations)) {
        setConversations(result.conversations);
      } else {
        throw new Error('Invalid response format');
      }

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

  // SECURITY FIX: Enhanced mark as read with proper authentication
  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabase.supabaseKey,
        },
        body: JSON.stringify({
          action: 'markAsRead',
          data: { message_id: messageId }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark message as read');
      }

      // Update local state
      setConversations(prev => prev.map(conv => ({
        ...conv,
        messages: conv.messages.map(msg => 
          msg.id === messageId 
            ? { ...msg, read_at: new Date().toISOString() }
            : msg
        )
      })));

    } catch (error: any) {
      console.error('Error marking message as read:', error);
      // Don't show toast for this error as it's not critical
    }
  };

  // Load conversations when user changes
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
    }
  }, [user]);

  return {
    conversations,
    isLoading,
    isSending,
    sendMessage,
    loadConversations,
    markAsRead
  };
};
