"use client"

import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

import ChatSidebar from './ChatSidebar';
import { useState, useEffect } from 'react';


export interface Message {
  sender: 'user' | 'bot';
  text: string;
  time: string;
  date?: string; 
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}


const Chatbot = () => {
  // SSR-safe initial state
  const [chats, setChats] = useState<ChatSession[]>([{ id: 'chat-1', title: 'New Chat', messages: [] }]);
  const [activeChatId, setActiveChatId] = useState('chat-1');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // On mount, load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedChats = localStorage.getItem('ellmer-chats');
      const storedActive = localStorage.getItem('ellmer-activeChatId');
      if (storedChats) {
        try {
          setChats(JSON.parse(storedChats));
        } catch {}
      }
      if (storedActive) setActiveChatId(storedActive);
      setHydrated(true);
    }
  }, []);

  const activeChat = chats.find(c => c.id === activeChatId) ?? chats[0];

  // Persist chats and activeChatId to localStorage
  useEffect(() => {
    if (hydrated && typeof window !== 'undefined') {
      localStorage.setItem('ellmer-chats', JSON.stringify(chats));
    }
  }, [chats, hydrated]);
  useEffect(() => {
    if (hydrated && typeof window !== 'undefined') {
      localStorage.setItem('ellmer-activeChatId', activeChatId);
    }
  }, [activeChatId, hydrated]);

  // Send message in active chat
  const handleSend = async (text: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const date = now.toISOString().slice(0, 10); // "YYYY-MM-DD"

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === activeChatId) {
        // If first user message, set title to first 30 chars
        let newTitle = chat.title;
        if (chat.messages.length === 0) {
          newTitle = text.length > 30 ? text.slice(0, 30) + '…' : text;
        }
        return {
          ...chat,
          title: newTitle,
          messages: [
            ...chat.messages,
            { sender: 'user', text, time, date } // <-- add date here
          ]
        };
      }
      return chat;
    }));

    // Send full conversation history to Python server
    try {
      // Get all messages for the current chat, convert to OpenAI format
      const currentChat = chats.find(chat => chat.id === activeChatId);
      const history = (currentChat?.messages || []).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));
      // Add the new user message
      history.push({ role: 'user', content: text });

      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });
      const data = await response.json();
      setChats(prevChats => prevChats.map(chat =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  sender: 'bot',
                  text: data.reply,
                  time: data.time,
                  date: data.date // <-- add this line
                }
              ]
            }
          : chat
      ));
    } catch (err) {
      setChats(prevChats => prevChats.map(chat =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [...chat.messages, { sender: 'bot', text: 'Error: Could not reach server.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
            }
          : chat
      ));
    }
  };

  // New chat
  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`;
    setChats(prev => [
      { id: newId, title: 'New Chat', messages: [] },
      ...prev
    ]);
    setActiveChatId(newId);
  };

  // Select chat
  const handleSelectChat = (id: string) => setActiveChatId(id);

  // Delete chat
  const handleDeleteChat = (id: string) => {
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) {
        // Always keep at least one chat
        const fallbackId = `chat-${Date.now()}`;
        setActiveChatId(fallbackId);
        return [{ id: fallbackId, title: 'New Chat', messages: [] }];
      }
      if (id === activeChatId) setActiveChatId(filtered[0].id);
      return filtered;
    });
  };

  // Sidebar for chat history
  if (!hydrated) {
    // Optionally, show a loading spinner here
    return null;
  }
  return (
    <div
      className={
        `flex flex-col ${fullscreen ? 'fixed inset-0 z-50 w-screen h-screen max-w-none max-h-none top: 0 left: 0' : 'w-full max-w-5xl mx-auto h-[90vh]'} border-2 border-blue-400 dark:border-blue-700 rounded-3xl shadow-2xl bg-gradient-to-br from-blue-50 via-white to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 animate-fade-in`
      }
    >
      <div className="flex items-center justify-between px-8 py-6 border-b-2 border-blue-100 dark:border-blue-900 bg-blue-100 dark:bg-blue-950 rounded-t-3xl">
        <ChatHeader />
        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-400 dark:text-blue-200 font-bold tracking-widest uppercase select-none">Powered by Langchain</span>
          <button
            onClick={() => setFullscreen(f => !f)}
            className="flex items-center gap-2 px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-200 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all z-10"
            aria-label={fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            tabIndex={0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              {fullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2h-2m-8 0H6a2 2 0 01-2-2v-2" />
              )}
            </svg>
          </button>
        </div>
      </div>
      <div className="flex flex-1 min-h-0">
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(c => !c)}
        />
        {/* Main chat area */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
            <ChatMessages messages={activeChat.messages} />
          </div>
          <div className="px-8 py-6 border-t-2 border-blue-100 dark:border-blue-900 bg-blue-100 dark:bg-blue-950 rounded-b-3xl">
            <ChatInput onSend={handleSend} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
