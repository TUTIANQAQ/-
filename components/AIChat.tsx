
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '准备好探索了吗？问我任何关于视觉美学或作品集的问题。⚡️' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Slight delay to allow state update to render before scrolling
    setTimeout(scrollToBottom, 100);

    const responseText = await sendMessageToGemini(input);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[90vw] md:w-96 bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl overflow-hidden shadow-2xl shadow-[#8B1D24]/10"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#8B1D24]/10 to-white p-4 flex justify-between items-center border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8B1D24] animate-pulse" />
                <h3 className="font-heading font-bold text-[#2C2C2C] tracking-wider">LUMI AI</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-[#2C2C2C]" data-hover="true">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={chatContainerRef}
              className="h-64 md:h-80 overflow-y-auto p-4 space-y-3 scroll-smooth"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#8B1D24] text-white rounded-tr-none shadow-md shadow-[#8B1D24]/30'
                        : 'bg-white text-[#2C2C2C] rounded-tl-none border border-gray-100 shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-lg rounded-tl-none border border-gray-100 flex gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-[#8B1D24]/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#8B1D24]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#8B1D24]/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100 bg-white/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="询问关于作品的想法..."
                  className="flex-1 bg-transparent text-[#2C2C2C] placeholder-gray-400 text-sm focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-[#8B1D24] p-2 rounded-lg hover:bg-[#6D161C] transition-colors disabled:opacity-50 shadow-md shadow-[#8B1D24]/30"
                  data-hover="true"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-[#8B1D24] to-[#6D161C] flex items-center justify-center shadow-lg shadow-[#8B1D24]/40 border border-white/20 z-50 group"
        data-hover="true"
      >
        {isOpen ? (
          <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
        ) : (
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:animate-bounce" />
        )}
      </motion.button>
    </div>
  );
};

export default AIChat;
