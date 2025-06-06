
import { supabase } from '@/integrations/supabase/client';
import { validateInput } from '@/utils/securityHelpers';
import { Conversation, Message } from '@/types/messaging';

const SUPABASE_URL = "https://yrrzazxxromdfhgqypjg.supabase.co";

export class MessagingApi {
  private static async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }
    return session;
  }

  private static async callEdgeFunction(action: string, data?: any) {
    const session = await this.getSession();
    const functionsUrl = `${SUPABASE_URL}/functions/v1/messages`;

    const response = await fetch(functionsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ action, data }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to ${action}`);
    }

    return response.json();
  }

  static async startConversation(userId: string, targetUserId: string): Promise<string | null> {
    // Get current user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Determine farmer_id and laborer_id based on roles
    let conversationData: {farmer_id: string, laborer_id: string};
    if (profile.role === 'farmer') {
      conversationData = {
        farmer_id: userId,
        laborer_id: targetUserId
      };
    } else if (profile.role === 'laborer') {
      conversationData = {
        farmer_id: targetUserId,
        laborer_id: userId
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

    if (existingConvo) {
      return existingConvo.id;
    }

    const result = await this.callEdgeFunction('createConversation', conversationData);
    return result.conversation.id;
  }

  static async sendMessage(conversationId: string, content: string): Promise<Message> {
    const trimmedContent = validateInput.string(content, 5000);
    if (trimmedContent.length === 0) {
      throw new Error('Message cannot be empty');
    }

    const result = await this.callEdgeFunction('sendMessage', {
      conversation_id: conversationId,
      content: trimmedContent,
      message_type: 'text'
    });

    return result.message;
  }

  static async loadConversations(): Promise<Conversation[]> {
    const result = await this.callEdgeFunction('getConversations');
    
    if (result.conversations && Array.isArray(result.conversations)) {
      return result.conversations;
    }
    
    throw new Error('Invalid response format');
  }

  static async markAsRead(messageId: string): Promise<void> {
    await this.callEdgeFunction('markAsRead', { message_id: messageId });
  }
}
