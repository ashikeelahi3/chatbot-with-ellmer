import { Message } from './Chatbot';
import MessageBubble from './MessageBubble';

interface Props {
  messages: Message[];
}

export default function ChatMessages({ messages }: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-2 py-4 space-y-3">
      {messages.map((msg, index) => (
        <MessageBubble
          key={index}
          sender={msg.sender}
          text={msg.text.replace(/\\\((.*?)\\\)/g, "$1")}
          time={msg.time}
          date={msg.date}
        />
      ))}
    </div>
  );
}
