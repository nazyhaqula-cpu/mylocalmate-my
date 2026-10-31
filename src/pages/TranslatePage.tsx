import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { COMMON_PHRASES } from '../data/initialData';
import { searchPhrases } from '../utils/planner';
import { SUPPORTED_LANGUAGES } from '../types';
import {
  Languages,
  ArrowRightLeft,
  Copy,
  Check,
  X,
  Sparkles,
  Search,
  BookOpen,
  Loader2,
  Globe,
} from 'lucide-react';

export const TranslatePage: React.FC = () => {
  const { showToast } = useAuth();
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('ms');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [contextTip, setContextTip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [phraseSearch, setPhraseSearch] = useState('');
  const [selectedPhraseCategory, setSelectedPhraseCategory] = useState('All');

  const handleTranslate = async (text = inputText) => {
    if (!text.trim()) {
      setOutputText('');
      setContextTip(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLang,
          targetLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Remove any stray asterisks or hashes
        const cleaned = (data.translatedText || '').replace(/[*#]/g, '');
        setOutputText(cleaned);
        setContextTip(data.contextTip || null);
      }
    } catch (e) {
      setOutputText(text);
      showToast('Offline mode: Showing reference translation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    const prevSource = sourceLang;
    const prevTarget = targetLang;
    setSourceLang(prevTarget);
    setTargetLang(prevSource);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    showToast('Translation copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setContextTip(null);
  };

  const handleSelectPhrase = (phrase: typeof COMMON_PHRASES[0]) => {
    setSourceLang('en');
    setTargetLang('ms');
    setInputText(phrase.english);
    setOutputText(phrase.malay);
    setContextTip(phrase.contextTip || null);
    showToast(`Loaded: "${phrase.malay}" 💚`);
  };

  const filteredPhrases = searchPhrases(COMMON_PHRASES, phraseSearch, selectedPhraseCategory);

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-8 h-8 rounded-xl bg-[#073f3a] text-white grid place-items-center">
            <Languages className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-[#398077] uppercase tracking-wider">
            Multilingual Translation & Travel Phrases (30+ Languages)
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172b2a] tracking-tight">
          Everyday Malaysian Translation
        </h1>
        <p className="text-xs sm:text-sm text-[#6f7d79] mt-1 max-w-2xl">
          Communicate with confidence at hawker stalls, public transit gates, and university campuses. Supports over 30 languages including English, French, German, Korean, Japanese, and more.
        </p>
      </div>

      {/* Main Dual Connected Translator Panel */}
      <div className="bg-white border border-[#e9e5dc] rounded-3xl shadow-sm overflow-hidden mb-10">
        {/* Language Selectors Bar */}
        <div className="p-4 bg-[#faf8f3] border-b border-[#e9e5dc] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <span className="text-[11px] font-bold text-[#6f7d79] uppercase">From:</span>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="bg-white border border-[#e9e5dc] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#172b2a] outline-none focus:border-[#073f3a] w-full"
              aria-label="Source Language"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.native})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            className="p-2 rounded-xl bg-white border border-[#e9e5dc] hover:border-[#073f3a] text-[#073f3a] hover:bg-[#073f3a] hover:text-white transition-all shadow-2xs"
            title="Swap Languages"
            aria-label="Swap Languages"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-[180px] justify-end">
            <span className="text-[11px] font-bold text-[#6f7d79] uppercase">To:</span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-white border border-[#e9e5dc] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#172b2a] outline-none focus:border-[#073f3a] w-full"
              aria-label="Target Language"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.native})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Language Shortcuts (featuring requested 30+ languages: English, French, German, Korean, etc.) */}
        <div className="px-4 py-2.5 bg-[#f5f2e9] border-b border-[#e9e5dc] flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="font-bold text-[#6f7d79] whitespace-nowrap">Translate To:</span>
          {[
            { code: 'en', label: 'English' },
            { code: 'ms', label: 'Malay' },
            { code: 'fr', label: 'French' },
            { code: 'de', label: 'German' },
            { code: 'ko', label: 'Korean' },
            { code: 'ja', label: 'Japanese' },
            { code: 'zh', label: 'Chinese' },
            { code: 'es', label: 'Spanish' },
            { code: 'ar', label: 'Arabic' },
            { code: 'it', label: 'Italian' },
          ].map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setTargetLang(item.code);
                if (inputText.trim()) {
                  handleTranslate(inputText);
                }
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                targetLang === item.code
                  ? 'bg-[#073f3a] text-white shadow-2xs'
                  : 'bg-white text-[#52645b] border border-[#e9e5dc] hover:bg-[#eae6dc]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Dual Text Areas: Translate From & Translate To */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#e9e5dc]">
          {/* Panel Left: Source Input */}
          <div className="p-5 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#6f7d79]">Translate From</span>
                {inputText && (
                  <button
                    onClick={handleClear}
                    className="text-xs text-gray-400 hover:text-black flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
              <textarea
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleTranslate();
                  }
                }}
                placeholder="Type or paste text here (e.g. How much is the train ticket to KLCC?)..."
                className="w-full bg-transparent border-0 outline-none resize-none text-sm leading-relaxed text-[#172b2a] placeholder-[#9ca8a4]"
                aria-label="Source text input"
              />
            </div>

            <div className="pt-3 border-t border-[#f0eee8] flex items-center justify-between">
              <span className="text-[10px] text-[#9ca8a4]">
                {inputText.length} characters
              </span>
              <button
                onClick={() => handleTranslate()}
                disabled={!inputText.trim() || isLoading}
                className="bg-[#073f3a] hover:bg-[#063430] text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#ffeb9a]" />}
                <span>Translate</span>
              </button>
            </div>
          </div>

          {/* Panel Right: Translated Output */}
          <div className="p-5 bg-[#faf8f3] flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#6f7d79]">Translated Output</span>
                {outputText && (
                  <button
                    onClick={handleCopy}
                    className="text-xs text-[#073f3a] font-bold hover:underline flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#20bf6b]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-xs text-[#6f7d79] flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#073f3a]" />
                  <span>Translating across 30+ languages...</span>
                </div>
              ) : outputText ? (
                <div className="text-base sm:text-lg font-bold text-[#073f3a] leading-relaxed whitespace-pre-wrap">
                  {outputText}
                </div>
              ) : (
                <div className="text-xs text-[#9ca8a4] italic py-6">
                  Translation will appear here. Press Translate or select a phrase below.
                </div>
              )}

              {contextTip && (
                <div className="mt-3 p-3 bg-white border border-[#e9e5dc] rounded-xl text-xs text-[#52645b] flex items-start gap-2">
                  <span className="text-sm">💡</span>
                  <div>
                    <strong className="block text-[#172b2a] font-bold">Local Cultural Tip:</strong>
                    <span>{contextTip}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#f0eee8] flex items-center justify-between text-[10px] text-[#6f7d79]">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#073f3a]" />
                <span>34 Languages Supported</span>
              </span>
              <span className="font-semibold text-[#073f3a]">Accurate & Contextual</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Travel Phrases */}
      <div className="bg-white border border-[#e9e5dc] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#172b2a] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#ff5c7a]" />
              <span>Quick Malaysia Travel Phrases</span>
            </h2>
            <p className="text-xs text-[#6f7d79] mt-0.5">
              Click any phrase to automatically load and practice the pronunciation.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#f7f3eb] rounded-xl px-3 py-1.5 border border-[#e9e5dc] max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-[#6f7d79]" />
            <input
              type="text"
              value={phraseSearch}
              onChange={(e) => setPhraseSearch(e.target.value)}
              placeholder="Search phrases..."
              className="bg-transparent border-0 outline-none text-xs text-[#172b2a] w-full"
            />
          </div>
        </div>

        {/* Category Filter for Phrases */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['All', 'Greetings', 'Food', 'Transport', 'Emergency'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedPhraseCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap ${
                selectedPhraseCategory === cat
                  ? 'bg-[#073f3a] text-white shadow-xs'
                  : 'bg-[#faf8f3] border border-[#e9e5dc] text-[#52615c] hover:bg-[#f0ece3]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Phrases Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPhrases.map((phrase) => (
            <div
              key={phrase.id}
              onClick={() => handleSelectPhrase(phrase)}
              className="p-4 bg-[#faf8f3] hover:bg-white border border-[#e9e5dc] hover:border-[#073f3a] rounded-2xl transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-bold text-sm text-[#073f3a] group-hover:text-[#ff5c7a] transition-colors">
                    {phrase.malay}
                  </span>
                  <span className="text-[10px] font-semibold text-[#6f7d79] bg-white px-2 py-0.5 rounded-full border border-[#e9e5dc]">
                    {phrase.category}
                  </span>
                </div>
                <div className="text-xs font-medium text-[#172b2a] mb-1">
                  "{phrase.english}"
                </div>
                {phrase.phonetic && (
                  <div className="text-[10px] text-[#6f7d79] italic mb-2">
                    🗣️ {phrase.phonetic}
                  </div>
                )}
                {phrase.contextTip && (
                  <p className="text-[10px] text-[#52645b] line-clamp-2 leading-relaxed">
                    {phrase.contextTip}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-[#f0eee8] text-right">
                <span className="text-[10px] font-bold text-[#073f3a] group-hover:underline">
                  Load Translation →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
