
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ConversationsList from '@/components/messaging/ConversationsList';
import ChatInterface from '@/components/messaging/ChatInterface';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, MessageCircle } from 'lucide-react';
import { Conversation } from '@/types/messaging';

const Messages = () => {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    isLoading,
    sendMessage,
  } = useMessaging();

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const handleSendMessage = async (content: string) => {
    if (activeConversationId) {
      await sendMessage(activeConversationId, content);
    }
  };

  const getActiveConversation = () => {
    return conversations.find(conv => conv.id === activeConversationId);
  };

  const getOtherUser = (conversation: Conversation | undefined) => {
    if (!conversation || !user) return { name: 'Unknown User', role: 'user' };
    
    if (conversation.farmer_id === user.id) {
      return {
        name: conversation.laborer_profile?.full_name || 'Unknown User',
        role: 'laborer'
      };
    }
    return {
      name: conversation.farmer_profile?.full_name || 'Unknown User',
      role: 'farmer'
    };
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading messages...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-1 bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageCircle className="h-8 w-8 text-primary" />
              Messages
            </h1>
            <p className="text-gray-600 mt-2">
              Connect and communicate with farmers and laborers
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Conversations</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto">
                  <ConversationsList
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    currentUserId={user?.id || ''}
                    onConversationSelect={handleConversationSelect}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2">
              {activeConversationId ? (
                (() => {
                  const activeConversation = getActiveConversation();
                  const otherUser = getOtherUser(activeConversation);
                  
                  return (
                    <ChatInterface
                      messages={messages}
                      currentUserId={user?.id || ''}
                      otherUserName={otherUser.name}
                      otherUserRole={otherUser.role}
                      onSendMessage={handleSendMessage}
                    />
                  );
                })()
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-500">
                      Choose a conversation from the list to start messaging
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Messages;
