interface Props {
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export default function MessageBubble({ sender, text, time }: Props) {
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
          {time}
        </span>
      </div>
    </div>
  );
}
