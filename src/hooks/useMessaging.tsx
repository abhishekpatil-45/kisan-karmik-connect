
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  farmer_id: string;
  laborer_id: string;
  created_at: string;
  updated_at: string;
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
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useMessaging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          farmer_profile:farmer_id(id, full_name, role),
          laborer_profile:laborer_id(id, full_name, role),
          messages(content, created_at, sender_id)
        `)
        .or(`farmer_id.eq.${user.id},laborer_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Process conversations to add last message info
      const processedConversations = data?.map(conv => ({
        ...conv,
        last_message: conv.messages && conv.messages.length > 0 
          ? conv.messages[conv.messages.length - 1]
          : null
      })) || [];

      setConversations(processedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Send a new message
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      // Update conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Refresh messages and conversations
      await fetchMessages(conversationId);
      await fetchConversations();

      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  }, [user, fetchMessages, fetchConversations, toast]);

  // Start a new conversation
  const startConversation = useCallback(async (otherUserId: string) => {
    if (!user) return null;

    try {
      // Get current user's profile to determine role
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get other user's profile to determine role
      const { data: otherProfile, error: otherProfileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', otherUserId)
        .single();

      if (otherProfileError) throw otherProfileError;

      // Determine farmer_id and laborer_id based on roles
      const farmerId = currentProfile.role === 'farmer' ? user.id : otherUserId;
      const laborerId = currentProfile.role === 'laborer' ? user.id : otherUserId;

      // Check if conversation already exists
      const { data: existingConv, error: existingError } = await supabase
        .from('conversations')
        .select('id')
        .eq('farmer_id', farmerId)
        .eq('laborer_id', laborerId)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existingConv) {
        setActiveConversationId(existingConv.id);
        await fetchMessages(existingConv.id);
        return existingConv.id;
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          farmer_id: farmerId,
          laborer_id: laborerId,
        })
        .select('id')
        .single();

      if (createError) throw createError;

      setActiveConversationId(newConv.id);
      await fetchConversations();
      return newConv.id;

    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, fetchMessages, fetchConversations, toast]);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId, fetchMessages]);

  return {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    isLoading,
    sendMessage,
    startConversation,
    fetchConversations,
    fetchMessages,
  };
};
