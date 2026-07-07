import React from 'react';

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
    status?: 'sending' | 'sent' | 'error';
  };
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = () => {
    if (message.status === 'sending') {
      return <span className="text-xs text-gray-400">⏳</span>;
    }
    if (message.status === 'sent') {
      return <span className="text-xs text-blue-500">✓✓</span>;
    }
    if (message.status === 'error') {
      return <span className="text-xs text-red-500">⚠️</span>;
    }
    return null;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 animate-fadeIn`}>
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-sm'
            : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-sm border border-slate-200 dark:border-slate-600'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        <div className={`flex items-center justify-end space-x-1 mt-1 ${isUser ? 'text-green-100' : 'text-slate-400'}`}>
          <span className="text-xs">{formatTime(message.timestamp)}</span>
          {isUser && getStatusIcon()}
        </div>
      </div>
    </div>
  );
};