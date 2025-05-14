
import React, { useState } from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { laborers, farmers } from '@/data/mockData';

const Messages = () => {
  const { toast } = useToast();
  const [activeChat, setActiveChat] = useState<string | null>('1');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Combine farmers and laborers for the chat list
  const contacts = [...farmers, ...laborers];
  
  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Example messages for the demo
  const chatMessages = [
    { id: '1', sender: 'them', text: "Hello, I saw that you're looking for rice field workers. I have 5 years of experience.", time: '10:30 AM' },
    { id: '2', sender: 'me', text: "Yes, I need help with harvest next month. When are you available?", time: '10:32 AM' },
    { id: '3', sender: 'them', text: "I'm available starting from the 15th of next month.", time: '10:35 AM' },
    { id: '4', sender: 'me', text: "That works perfectly. What are your wage expectations?", time: '10:40 AM' },
    { id: '5', sender: 'them', text: "I typically charge ₹500 per day for rice harvesting.", time: '10:42 AM' }
  ];
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    console.log('Sending message:', message);
    toast({
      title: "Message sent",
      description: "Your message has been delivered.",
    });
    
    setMessage('');
  };
  
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
                {filteredContacts.map(contact => (
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
                    {contact.id === '1' && (
                      <div className="bg-primary-500 rounded-full h-2 w-2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Chat Main Content */}
            {activeChat ? (
              <div className="hidden md:flex flex-col flex-1">
                {/* Chat header */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <img 
                    src={filteredContacts.find(c => c.id === activeChat)?.image || ''} 
                    alt="Contact" 
                    className="h-10 w-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h3 className="font-medium">{filteredContacts.find(c => c.id === activeChat)?.name}</h3>
                    <p className="text-xs text-gray-500">
                      {filteredContacts.find(c => c.id === activeChat)?.location}
                    </p>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : ''}`}
                    >
                      <div 
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          msg.sender === 'me' 
                            ? 'bg-primary-100 text-primary-900' 
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'me' 
                            ? 'text-primary-600' 
                            : 'text-gray-500'
                        }`}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
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
