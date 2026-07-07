import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-white dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-200 dark:border-slate-600">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">Assistant écrit...</span>
        </div>
      </div>
    </div>
  );
};