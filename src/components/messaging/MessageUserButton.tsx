
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';
import { useNavigate } from 'react-router-dom';

interface MessageUserButtonProps {
  targetUserId: string;
  targetUserName: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const MessageUserButton = ({
  targetUserId,
  targetUserName,
  variant = "default",
  size = "default",
  className = "",
}: MessageUserButtonProps) => {
  const { user } = useAuth();
  const { startConversation } = useMessaging();
  const navigate = useNavigate();

  const handleMessageUser = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user.id === targetUserId) {
      return; // Can't message yourself
    }

    const conversationId = await startConversation(targetUserId);
    if (conversationId) {
      navigate('/messages');
    }
  };

  // Don't show button if it's the current user
  if (user?.id === targetUserId) {
    return null;
  }

  return (
    <Button
      onClick={handleMessageUser}
      variant={variant}
      size={size}
      className={className}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Message {targetUserName}
    </Button>
  );
};

export default MessageUserButton;
