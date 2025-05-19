
import React, { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface Contact {
  id: string;
  name: string;
  location: string;
  image: string;
  role: string;
  lastActive?: string;
  hasUnread?: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: string;
  read: boolean;
}

const Messages = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    if (activeChat && user) {
      fetchMessages(activeChat);
    }
  }, [activeChat, user]);

  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      setIsLoadingContacts(true);
      
      const { data: userProfileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!userProfileData) throw new Error('User profile not found');
      
      // Fetch profiles with opposite role to show as contacts
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match the Contact interface
      const processedContacts: Contact[] = (data || []).map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Unnamed User',
        location: profile.location || 'Unknown Location',
        image: `/avatars/${profile.role === 'farmer' ? 'farmer' : 'laborer'}${Math.floor(Math.random() * 5) + 1}.jpg`,
        role: profile.role,
        lastActive: new Date().toISOString(),
        hasUnread: Math.random() > 0.7 // Random for demo
      }));
      
      setContacts(processedContacts);
      
      // Set first contact as active if none selected
      if (processedContacts.length > 0 && !activeChat) {
        setActiveChat(processedContacts[0].id);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    if (!user) return;
    
    try {
      setIsLoadingMessages(true);
      
      // We would normally have a messages table in the database
      // For now, generate mock messages
      const mockMessages = [
        { id: '1', sender_id: contactId, receiver_id: user.id, text: "Hello, I'm interested in hiring you.", created_at: new Date(Date.now() - 3600000).toISOString(), read: true },
        { id: '2', sender_id: user.id, receiver_id: contactId, text: "Hi there! I'd be happy to discuss work opportunities.", created_at: new Date(Date.now() - 3500000).toISOString(), read: true },
        { id: '3', sender_id: contactId, receiver_id: user.id, text: "Great! I need help with my farm next month.", created_at: new Date(Date.now() - 3400000).toISOString(), read: true },
        { id: '4', sender_id: user.id, receiver_id: contactId, text: "What type of work are you looking for?", created_at: new Date(Date.now() - 3300000).toISOString(), read: true },
        { id: '5', sender_id: contactId, receiver_id: user.id, text: "Primarily harvesting and some planting.", created_at: new Date(Date.now() - 3200000).toISOString(), read: false },
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChat || !user) return;
    
    try {
      // Create new message
      const newMessage = {
        id: Date.now().toString(),
        sender_id: user.id,
        receiver_id: activeChat,
        text: message,
        created_at: new Date().toISOString(),
        read: false
      };
      
      // Add to messages list
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      toast({
        title: "Message sent",
        description: "Your message has been delivered.",
      });
      
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    contact.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Find active contact details
  const activeContact = contacts.find(c => c.id === activeChat);
  
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to view messages</h1>
            <Button asChild>
              <a href="/auth">Sign In</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-250px)] min-h-[500px] flex overflow-hidden">
            {/* Chat Sidebar */}
            <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search conversations..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="overflow-y-auto flex-1">
                {isLoadingContacts ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2">Loading contacts...</span>
                  </div>
                ) : filteredContacts.length > 0 ? (
                  filteredContacts.map(contact => (
                    <div 
                      key={contact.id}
                      className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${activeChat === contact.id ? 'bg-primary-50' : ''}`}
                      onClick={() => setActiveChat(contact.id)}
                    >
                      <img 
                        src={contact.image} 
                        alt={contact.name} 
                        className="h-12 w-12 rounded-full object-cover mr-3" 
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                        <p className="text-sm text-gray-500 truncate">
                          {contact.location}
                        </p>
                      </div>
                      {contact.hasUnread && (
                        <div className="bg-primary-500 rounded-full h-2 w-2"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No contacts found.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Chat Main Content */}
            {activeChat ? (
              <div className="hidden md:flex flex-col flex-1">
                {/* Chat header */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  {activeContact && (
                    <>
                      <img 
                        src={activeContact.image} 
                        alt={activeContact.name} 
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                      <div>
                        <h3 className="font-medium">{activeContact.name}</h3>
                        <p className="text-xs text-gray-500">
                          {activeContact.location}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2">Loading messages...</span>
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map(msg => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.sender_id === user.id ? 'justify-end' : ''}`}
                      >
                        <div 
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            msg.sender_id === user.id 
                              ? 'bg-primary-100 text-primary-900' 
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender_id === user.id 
                              ? 'text-primary-600' 
                              : 'text-gray-500'
                          }`}>
                            {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>
                
                {/* Message input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex">
                  <Input 
                    placeholder="Type a message..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 mr-2"
                  />
                  <Button type="submit" size="icon">
                    <Send size={16} />
                  </Button>
                </form>
              </div>
            ) : (
              <div className="hidden md:flex flex-col flex-1 items-center justify-center text-center p-4">
                <div className="bg-gray-100 rounded-full p-6 mb-4">
                  <Send size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Your Messages</h3>
                <p className="text-gray-600 max-w-sm">
                  Select a conversation or start a new one by connecting with farmers and laborers.
                </p>
              </div>
            )}
            
            {/* Mobile message selection notice */}
            <div className="flex md:hidden flex-col flex-1 items-center justify-center text-center p-4">
              <p className="text-gray-600">
                Please select a conversation from the list.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Messages;
