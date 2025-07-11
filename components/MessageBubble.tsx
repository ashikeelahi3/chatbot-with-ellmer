import React from 'react';

interface Props {
  sender: 'user' | 'bot';
  text: string;
  time: string;
  date?: string;
}

function formatDateTime(time: string, date?: string) {
  if (!date) return time;
  // Convert "10:11 PM" to 22:11
  const [hourMin, ampm] = time.split(' ');
  let [hour, minute] = hourMin.split(':').map(Number);
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  // Compose ISO string
  const iso = `${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
  const dateObj = new Date(iso);
  // Format: 10:11 PM, Jul 7, 2025
  return dateObj.toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const MessageBubble: React.FC<Props> = ({ sender, text, time, date }) => {
  const isUser = sender === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`relative max-w-xs md:max-w-md px-4 py-2 rounded-xl text-white ${
          isUser ? 'bg-blue-500' : 'bg-gray-700'
        } whitespace-pre-line break-words`}
      >
        {text}
        <span className="block text-xs text-gray-200 opacity-70 mt-1 text-right select-none">
          {formatDateTime(time, date)}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
