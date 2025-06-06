
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { validateInput } from '@/utils/securityHelpers';

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
  farmer_profile?: {
    full_name: string;
  };
  laborer_profile?: {
    full_name: string;
  };
}

export const useMessaging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Start a new conversation with another user
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
      
      // Get current session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      // Get current user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile) {
        throw new Error('User profile not found');
      }

      // Determine farmer_id and laborer_id based on roles
      let conversationData: {farmer_id: string, laborer_id: string};
      if (profile.role === 'farmer') {
        conversationData = {
          farmer_id: user.id,
          laborer_id: targetUserId
        };
      } else if (profile.role === 'laborer') {
        conversationData = {
          farmer_id: targetUserId,
          laborer_id: user.id
        };
      } else {
        throw new Error('Invalid user role');
      }

      // Check if conversation already exists
      const { data: existingConvo } = await supabase
        .from('conversations')
        .select('id')
        .eq('farmer_id', conversationData.farmer_id)
        .eq('laborer_id', conversationData.laborer_id)
        .maybeSingle();

      // If conversation exists, return its ID
      if (existingConvo) {
        setActiveConversationId(existingConvo.id);
        return existingConvo.id;
      }

      // Create new conversation via edge function for enhanced security
      const apiUrl = `${supabase.supabaseUrl}/functions/v1/messages`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabase.supabaseKey || '',
        },
        body: JSON.stringify({
          action: 'createConversation',
          data: conversationData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create conversation');
      }

      const result = await response.json();
      
      // Update local state with new conversation
      const newConvo = result.conversation;
      setConversations(prev => [newConvo, ...prev]);
      setActiveConversationId(newConvo.id);

      return newConvo.id;

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
      const trimmedContent = validateInput.string(content, 5000);
      if (trimmedContent.length === 0) {
        throw new Error('Message cannot be empty');
      }

      // Using URL constructor to safely construct the URL
      const apiUrl = `${supabase.supabaseUrl}/functions/v1/messages`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabase.supabaseKey || '',
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

      // Also update messages array if this is the active conversation
      if (activeConversationId === conversationId) {
        setMessages(prev => [...prev, result.message]);
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

      // Using URL constructor to safely construct the URL
      const apiUrl = `${supabase.supabaseUrl}/functions/v1/messages`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabase.supabaseKey || '',
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
        
        // If we have an active conversation, load its messages
        if (activeConversationId) {
          const activeConvo = result.conversations.find((c: Conversation) => c.id === activeConversationId);
          if (activeConvo && activeConvo.messages) {
            setMessages(activeConvo.messages);
          }
        }
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

      // Using URL constructor to safely construct the URL
      const apiUrl = `${supabase.supabaseUrl}/functions/v1/messages`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabase.supabaseKey || '',
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

      // Also update messages array
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, read_at: new Date().toISOString() }
          : msg
      ));

    } catch (error: any) {
      console.error('Error marking message as read:', error);
      // Don't show toast for this error as it's not critical
    }
  };

  // Update messages when active conversation changes
  useEffect(() => {
    if (activeConversationId && conversations.length > 0) {
      const activeConvo = conversations.find(c => c.id === activeConversationId);
      if (activeConvo) {
        setMessages(activeConvo.messages || []);
      }
    } else {
      setMessages([]);
    }
  }, [activeConversationId, conversations]);

  // Load conversations when user changes
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setMessages([]);
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
    markAsRead
  };
};
