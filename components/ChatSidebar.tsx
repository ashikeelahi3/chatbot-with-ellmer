import React from 'react';

interface ChatSession {
  id: string;
  title: string;
  messages: { sender: 'user' | 'bot'; text: string }[];
}

interface ChatSidebarProps {
  chats: ChatSession[];
  activeChatId: string;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  collapsed,
  onToggle,
}) => {
  return (
    <aside
      className={`relative transition-all duration-300 flex flex-col bg-blue-50 dark:bg-blue-950 rounded-l-3xl gap-4 overflow-hidden border-r-2 border-blue-100 dark:border-blue-900 shadow-lg ${collapsed ? 'w-10 min-w-0 p-0' : 'p-4 w-[160px]'}`}
      style={!collapsed ? { minHeight: '100%' } : { minHeight: '100%' }}
    >
      <button
        onClick={onToggle}
        className={`absolute top-4 z-20 bg-blue-400 dark:bg-blue-800 text-white px-2 py-1 shadow hover:bg-blue-500 dark:hover:bg-blue-700 focus:outline-none transition-all ${collapsed ? 'left-0 rounded-r-lg' : '-right-1 rounded-l-lg'}`}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        tabIndex={0}
      >
        {collapsed ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        )}
      </button>
      {!collapsed && (
        <>
          <button
            onClick={onNewChat}
            className="flex items-center gap-2 px-3 py-2 mt-9 mb-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow transition-all w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
            {chats.length === 0 && (
              <div className="text-center text-gray-400 mt-8">No chats yet</div>
            )}
            {chats.map(chat => (
              <div
                key={chat.id}
                className={`group flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer transition-all ${chat.id === activeChatId ? 'bg-blue-200 dark:bg-blue-800 font-bold' : 'hover:bg-blue-100 dark:hover:bg-blue-900'}`}
                onClick={() => onSelectChat(chat.id)}
                tabIndex={0}
                role="button"
                aria-current={chat.id === activeChatId}
              >
                <span className="truncate flex-1" title={chat.title}>{chat.title}</span>
                {chats.length > 1 && (
                  <button
                    className="ml-2 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-500 hover:text-red-700"
                    onClick={e => { e.stopPropagation(); onDeleteChat(chat.id); }}
                    aria-label="Delete chat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
};

export default ChatSidebar;
