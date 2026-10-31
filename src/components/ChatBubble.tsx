import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChatMessage, Destination } from '../types';
import { sanitizePlainText } from '../utils/planner';
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  MapPin,
  Plus,
  Compass,
  ArrowRight,
  Bot,
  Zap,
} from 'lucide-react';

const FAST_SUGGESTIONS = [
  'One-day trip in KL',
  'Best street food spots',
  'MRT & Touch n Go guide',
  'Cheap student eats',
];

export const ChatBubble: React.FC = () => {
  const {
    isChatOpen,
    setIsChatOpen,
    chatInitialPrompt,
    navigateTo,
    showToast,
  } = useAuth();

  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'bubble-welcome-1',
      sender: 'assistant',
      text: "Selamat sejahtera! 🌺 I'm your MyLocal Mate AI. Ask me anything—street food, MRT routes, one-day itineraries, or daily questions. Fast answers, mate!",
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isChatOpen, messages, isLoading]);

  // Handle initial prompt passed from other buttons
  useEffect(() => {
    if (chatInitialPrompt && isChatOpen) {
      handleSendMessage(chatInitialPrompt);
    }
  }, [chatInitialPrompt, isChatOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = nextMessages.slice(-4).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const startTime = performance.now();
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const latencyMs = Math.round(performance.now() - startTime);

      const rawReply =
        data.reply ||
        "I'm here to help, mate! Feel free to ask about Malaysian food, MRT navigation, or day trips.";
      const cleanReply = sanitizePlainText(rawReply);

      const assistantMessage: ChatMessage = {
        id: 'reply-' + Date.now(),
        sender: 'assistant',
        text: cleanReply,
        timestamp: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${latencyMs}ms)`,
        recommendedPlaces: data.recommendedPlaces,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: "I couldn't reach the server right now, mate. Please try again shortly!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'bubble-reset-' + Date.now(),
        sender: 'assistant',
        text: "Chat cleared! 🌺 What would you like to explore or ask next?",
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* 1. FLOATING CHAT BUBBLE BUTTON (Always docked in corner) */}
      {/* ---------------------------------------------------- */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2">
        {!isChatOpen && (
          <div className="hidden sm:flex items-center gap-2 bg-[#073f3a] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-white/20 animate-in fade-in duration-300">
            <span className="w-2 h-2 rounded-full bg-[#20bf6b] animate-ping" />
            <span>Fast AI Mate</span>
          </div>
        )}

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          aria-label={isChatOpen ? 'Close AI chat bubble' : 'Open AI chat assistant'}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative group ${
            isChatOpen
              ? 'bg-[#172b2a] text-white rotate-90 scale-95'
              : 'bg-[#073f3a] hover:bg-[#052e2a] text-white hover:scale-105 ring-4 ring-[#073f3a]/20'
          }`}
        >
          {isChatOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-7 h-7 text-[#ffeb9a]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff5c7a] rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white">
                ⚡
              </span>
            </>
          )}
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. SLIDE-UP / POP-OUT CHAT WINDOW */}
      {/* ---------------------------------------------------- */}
      {isChatOpen && (
        <div
          role="dialog"
          aria-label="MyLocal Mate AI Assistant"
          className={`fixed z-50 bg-white border border-[#e9e5dc] rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'inset-4 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[650px] sm:h-[720px]'
              : 'bottom-22 right-3 left-3 sm:left-auto sm:right-6 sm:bottom-24 w-auto sm:w-[420px] h-[550px]'
          }`}
        >
          {/* Header */}
          <div className="bg-[#073f3a] text-white px-4 py-3.5 flex items-center justify-between border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-[#ffeb9a] border border-white/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm flex items-center gap-1.5 leading-none">
                  <span>MyLocal Mate AI</span>
                  <span className="bg-[#ffeb9a] text-[#073f3a] text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 fill-current" /> Fast
                  </span>
                </div>
                <div className="text-[11px] text-[#98cdc4] flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-[#20bf6b] inline-block" />
                  <span>Instant local intelligence</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Clear Chat"
                aria-label="Clear chat"
                className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
                aria-label={isExpanded ? 'Collapse window' : 'Expand window'}
                className="hidden sm:flex w-8 h-8 rounded-lg hover:bg-white/10 text-white/80 hover:text-white items-center justify-center transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsChatOpen(false)}
                title="Close Chat"
                aria-label="Close chat"
                className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf8f3]">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-[#073f3a] text-white rounded-br-xs'
                        : 'bg-white text-[#172b2a] border border-[#e9e5dc] rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>

                    {/* Destination Cards embedded in reply */}
                    {m.recommendedPlaces && m.recommendedPlaces.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#e9e5dc] space-y-2">
                        <div className="text-[11px] font-bold text-[#398077] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#ff5c7a]" />
                          <span>Recommended Places:</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {m.recommendedPlaces.map((place) => (
                            <div
                              key={place.id}
                              className="bg-[#f7f3eb] rounded-xl p-2.5 border border-[#e4ded3] flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-[12px] text-[#172b2a] truncate">
                                  {place.name}
                                </div>
                                <div className="text-[10px] text-[#6f7d79]">
                                  {place.category} · ★ {place.rating} · {place.price}
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  navigateTo('explore-map', { selectedPlaceId: place.id });
                                  setIsChatOpen(false);
                                }}
                                className="bg-[#073f3a] text-white text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-[#052e2a] flex items-center gap-1 whitespace-nowrap"
                              >
                                <span>Map</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#8c9b97] mt-1 px-1">
                    {m.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Fast Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 bg-white border border-[#e9e5dc] rounded-2xl px-4 py-2.5 text-xs text-[#52615c] w-fit shadow-2xs animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-[#ff5c7a] animate-spin" />
                <span>Generating fast answer...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-2 bg-white border-t border-[#e9e5dc] flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
            {FAST_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSendMessage(s)}
                disabled={isLoading}
                className="text-[11px] bg-[#f7f3eb] hover:bg-[#ede7da] text-[#172b2a] px-2.5 py-1 rounded-full whitespace-nowrap border border-[#e9e5dc] transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-[#e9e5dc] flex items-center gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask anything (food, routes, questions)..."
              disabled={isLoading}
              className="flex-1 bg-[#f7f3eb] border border-[#e9e5dc] rounded-xl px-3.5 py-2 text-xs text-[#172b2a] focus:outline-none focus:border-[#073f3a] focus:bg-white transition-all disabled:opacity-60"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="w-9 h-9 rounded-xl bg-[#073f3a] hover:bg-[#052e2a] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-[#073f3a] shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
