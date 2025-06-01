
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const Messages = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time and then mark as loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold mb-8">Messages</h1>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 text-center">
              No messages yet. Start connecting with farmers and laborers to begin conversations.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Messages;
