import { useState } from 'react';

interface Props {
  onSend: (text: string) => void;
}

export default function ChatInput({ onSend }: Props) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-white dark:bg-blue-950 rounded-xl shadow-md px-4 py-2 border-2 border-blue-100 dark:border-blue-900">
      <textarea
        className="flex-1 p-3 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none min-h-[44px] max-h-40 hide-scrollbar"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <button
        type="submit"
        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all disabled:opacity-50"
        disabled={!input.trim()}
        aria-label="Send message"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5l7.5 7.5 7.5-7.5M12 3v15" />
        </svg>
        Send
      </button>
    </form>
  );
}
