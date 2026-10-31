import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChatMessage, Destination } from '../types';
import { sanitizePlainText } from '../utils/planner';
import {
  Sparkles,
  Send,
  MapPin,
  Bot,
  User as UserIcon,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Plan a one-day trip in Kuala Lumpur.',
  'What are the best local street food spots in KL?',
  'How do I take the MRT and pay with Touch n Go?',
  'Where can I find affordable student-friendly food in PJ?',
  'Can you explain the difference between LRT and MRT?',
  'Recommend weekend getaways from Kuala Lumpur.',
];

export const AIAssistantPage: React.FC = () => {
  const { navigateTo } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Selamat sejahtera and hey, mate! 🌺 I'm your MyLocal Mate AI companion. I can answer ANY question—from local Malaysian food and transit routes to itineraries, student advice, or general everyday questions! What would you like to ask or explore today?",
      timestamp: 'Just now',
      suggestedActions: [
        { label: 'One-Day KL Trip', action: 'Plan a one-day trip in Kuala Lumpur.' },
        { label: 'Top Street Food', action: 'What are the best local street food spots in KL?' },
        { label: 'MRT & Touch n Go Guide', action: 'How do I take the MRT and pay with Touch n Go?' },
        { label: 'Ask Any Question', action: 'What are the top cultural customs to know in Malaysia?' },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const recentHistory = updatedMessages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: recentHistory,
        }),
      });

      const data = await res.json();
      const rawReply = data.reply || "I'm having a little trouble connecting right now, mate. Please try again shortly!";
      // Strict cleanup of any '*' and '#' symbols
      const cleanReply = sanitizePlainText(rawReply);

      const assistantMessage: ChatMessage = {
        id: 'reply-' + Date.now(),
        sender: 'assistant',
        text: cleanReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedPlaces: data.recommendedPlaces,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          sender: 'assistant',
          text: "Sorry mate, I couldn't reach the server. Please check your connection and try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset-' + Date.now(),
        sender: 'assistant',
        text: "Fresh chat started! 🌺 Ask me anything—food recommendations, transit directions, itinerary planning, or any general question.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: 'One-Day KL Trip', action: 'Plan a one-day trip in Kuala Lumpur.' },
          { label: 'Top Street Food', action: 'What are the best local street food spots in KL?' },
          { label: 'Transit Guide', action: 'How do I take the MRT and pay with Touch n Go?' },
        ],
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-[1050px] mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-[#ff5c7a]/15 text-[#ff5c7a] grid place-items-center font-bold text-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-[#398077] uppercase tracking-wider">
              Smart AI Local Companion
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172b2a] tracking-tight">
            Ask Anything, Mate!
          </h1>
          <p className="text-xs sm:text-sm text-[#6f7d79] mt-1 max-w-2xl">
            Ask any question—from Malaysian street food and MRT navigation to custom itineraries, life advice, or general inquiries. Powered by smart local AI assistance.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="self-start sm:self-auto bg-white border border-[#e9e5dc] hover:bg-[#faf7f2] text-[#52615c] text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#6f7d79]" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Suggested Prompts Banner */}
      <div className="mb-6 bg-white border border-[#e9e5dc] rounded-2xl p-4 shadow-sm">
        <div className="text-[11px] font-bold text-[#6f7d79] uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#ff5c7a]" />
            <span>Suggested Questions (Click to Ask)</span>
          </span>
          <span className="text-[10px] bg-[#e5f1dc] text-[#28583d] font-bold px-2 py-0.5 rounded-full">
            All Topics Welcome
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs bg-[#f7f3eb] hover:bg-[#073f3a] text-[#172b2a] hover:text-white px-3.5 py-2 rounded-full font-medium transition-all text-left"
            >
              “{prompt}”
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white border border-[#e9e5dc] rounded-3xl shadow-sm overflow-hidden flex flex-col h-[620px]">
        {/* Messages Scroll Area */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const displayText = sanitizePlainText(msg.text);
            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl grid place-items-center text-xs font-bold flex-shrink-0 shadow-sm ${
                    isUser ? 'bg-[#073f3a] text-white' : 'bg-[#ff5c7a] text-white'
                  }`}
                >
                  {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                </div>

                {/* Message Content Bubble */}
                <div className={`max-w-[88%] sm:max-w-[80%] space-y-3 ${isUser ? 'items-end text-right' : 'items-start'}`}>
                  <div
                    className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                      isUser
                        ? 'bg-[#073f3a] text-white rounded-tr-none shadow-sm'
                        : 'bg-[#f7f3eb] text-[#172b2a] rounded-tl-none border border-[#e9e5dc]'
                    }`}
                  >
                    {displayText}
                  </div>

                  {/* Suggested Quick Actions */}
                  {msg.suggestedActions && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(act.action)}
                          className="text-[11px] bg-white border border-[#073f3a]/30 text-[#073f3a] hover:bg-[#073f3a] hover:text-white font-semibold px-3 py-1.5 rounded-full transition-colors shadow-2xs"
                        >
                          {act.label} →
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Destination Cards returned by assistant */}
                  {msg.recommendedPlaces && msg.recommendedPlaces.length > 0 && (
                    <div className="pt-2 text-left">
                      <div className="text-[11px] font-bold text-[#6f7d79] mb-2 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#ff5c7a]" />
                        <span>Recommended Destinations:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {msg.recommendedPlaces.map((place) => (
                          <div
                            key={place.id}
                            className="bg-white border border-[#e9e5dc] rounded-2xl p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div className="flex gap-3">
                              <img
                                src={place.imageUrl}
                                alt={place.name}
                                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-xs text-[#172b2a] truncate">{place.name}</h4>
                                <span className="text-[10px] text-[#8c6a13] font-semibold">
                                  ★ {place.rating} · {place.category}
                                </span>
                                <p className="text-[10px] text-[#6f7d79] line-clamp-2 mt-1">{place.description}</p>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-[#f0eee8] flex items-center justify-between gap-2">
                              <button
                                onClick={() => navigateTo('explore-map', { selectedPlaceId: place.id })}
                                className="text-[11px] font-bold text-[#073f3a] hover:underline flex items-center gap-1"
                              >
                                <MapPin className="w-3 h-3 text-[#ff5c7a]" />
                                <span>View on Map</span>
                              </button>
                              <button
                                onClick={() => navigateTo('trip-planner', { addPlace: place })}
                                className="text-[10px] bg-[#073f3a] text-white font-semibold px-2.5 py-1 rounded-lg hover:bg-[#063430]"
                              >
                                + Add to Trip
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-[#9ca8a4] px-1">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 items-center">
              <div className="w-9 h-9 rounded-2xl bg-[#ff5c7a] text-white grid place-items-center text-xs font-bold flex-shrink-0">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="bg-[#f7f3eb] border border-[#e9e5dc] rounded-2xl rounded-tl-none p-4 text-xs text-[#6f7d79] flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#073f3a]" />
                <span>MyLocal Mate is consulting verified local guides and map routes...</span>
              </div>
            </div>
          )}
        </div>

        {/* Message Input Bar */}
        <div className="p-4 bg-[#faf8f3] border-t border-[#e9e5dc]">
          <div className="flex items-center gap-2 bg-white border border-[#e9e5dc] rounded-2xl p-2 shadow-xs focus-within:border-[#073f3a] focus-within:ring-2 focus-within:ring-[#073f3a]/10">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything (e.g. Best laksa in Penang, LRT map directions, or any life question)..."
              className="flex-1 bg-transparent border-0 outline-none px-3 text-xs sm:text-sm text-[#172b2a] placeholder-[#9ca8a4]"
              disabled={isLoading}
              aria-label="Message to AI Assistant"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className={`w-10 h-10 rounded-xl grid place-items-center transition-all ${
                input.trim() && !isLoading
                  ? 'bg-[#073f3a] text-white shadow-sm hover:scale-105'
                  : 'bg-[#e9e5dc] text-[#9ca8a4] cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#9ca8a4] mt-2 px-1">
            <span>Tips: Press Enter to send · Clean text with no symbols</span>
            <span className="font-semibold text-[#073f3a]">Ask Anything 💚</span>
          </div>
        </div>
      </div>
    </div>
  );
};
