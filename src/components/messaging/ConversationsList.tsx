
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

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

interface ConversationsListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  currentUserId: string;
  onConversationSelect: (conversationId: string) => void;
}

const ConversationsList = ({
  conversations,
  activeConversationId,
  currentUserId,
  onConversationSelect,
}: ConversationsListProps) => {
  const getOtherUser = (conversation: Conversation) => {
    if (conversation.farmer_id === currentUserId) {
      return conversation.laborer_profile;
    }
    return conversation.farmer_profile;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No conversations yet</p>
        <p className="text-sm">Start connecting with farmers and laborers to begin messaging</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const otherUser = getOtherUser(conversation);
        const isActive = conversation.id === activeConversationId;
        
        return (
          <Card
            key={conversation.id}
            className={`cursor-pointer transition-colors hover:bg-gray-50 ${
              isActive ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => onConversationSelect(conversation.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`/avatars/${otherUser?.role}1.jpg`} />
                  <AvatarFallback>
                    {otherUser?.full_name ? getInitials(otherUser.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {otherUser?.full_name || 'Unknown User'}
                    </p>
                    {conversation.last_message && (
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {otherUser?.role === 'farmer' ? 'Farmer' : 'Laborer'}
                    </Badge>
                  </div>
                  
                  {conversation.last_message && (
                    <p className="text-xs text-gray-600 truncate mt-1">
                      {conversation.last_message.content}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ConversationsList;
