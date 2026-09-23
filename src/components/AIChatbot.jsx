import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

/* ─────────────────────────────────────────────────────────────────
   AI KNOWLEDGE BASE — Agri-focused simulated intelligence
   Maps keywords → contextual farming-relevant responses
───────────────────────────────────────────────────────────────── */
const AI_KNOWLEDGE = [
  {
    keywords: ['price', 'pricing', 'rate', 'cost', 'msp', 'minimum support'],
    response: (ctx) =>
      `📊 **Current AI Price Insights**\n\nBased on live Nashik mandi data:\n• 🍅 Tomato: ₹${ctx.aiPrice ?? 22}/kg (your listing rate)\n• 🧅 Onion: ₹18–22/kg (stable)\n• 🥔 Potato: ₹16–19/kg (slight dip)\n\n💡 **Tip:** Listing 100kg+ gets you a **15% bulk premium** automatically via KisanConnect AI!`,
  },
  {
    keywords: ['weather', 'rain', 'monsoon', 'season', 'climate'],
    response: () =>
      `🌦️ **Nashik District Weather Advisory**\n\nCurrent forecast (24–48h):\n• Light rainfall expected — ideal post-harvest conditions\n• Humidity: 68% → refrigerated storage recommended for tomatoes\n\n⚠️ Avoid open-truck logistics tomorrow. KisanConnect will auto-assign covered vehicles for your listings.`,
  },
  {
    keywords: ['sell', 'list', 'listing', 'how to list', 'upload'],
    response: () =>
      `✅ **How to List Produce**\n\n1️⃣ Select your **crop** from the dropdown\n2️⃣ Enter **quantity** (kg)\n3️⃣ Our AI auto-suggests the best price\n4️⃣ Tap **"List Produce Now"** — done!\n\n🎙️ **Pro tip:** Use the voice button to speak: *"100 kg tomato"* — the AI will fill the form for you!`,
  },
  {
    keywords: ['demand', 'buyer', 'market', 'who', 'order'],
    response: () =>
      `🏢 **Today's Active Buyer Demand**\n\nTop orders awaiting farmers:\n• Reliance Fresh — 500kg Onion @ ₹20/kg\n• D-Mart Logistics — 300kg Tomato @ ₹24/kg\n• Metro Cash — 200kg Potato @ ₹17/kg\n\nYour listing gets instantly matched to these pools. Higher quantity → faster match!`,
  },
  {
    keywords: ['transport', 'logistics', 'truck', 'vehicle', 'pickup', 'route', 'delivery'],
    response: () =>
      `🚚 **Logistics & Routing**\n\nKisanConnect uses a **VRP (Vehicle Routing) optimizer** to:\n• Calculate shortest routes from your farm to Nashik Hub\n• Assign refrigerated vehicles for temperature-sensitive crops\n• Provide real-time GPS tracking\n\nExpected pickup time for listed produce: **2–4 hours**. Our driver will call 30 mins before arrival.`,
  },
  {
    keywords: ['tomato', 'onion', 'potato', 'wheat', 'chilli', 'brinjal', 'crop'],
    response: () =>
      `🌾 **Crop-Specific Advice**\n\n• **Tomato** — Best sold within 48hrs of harvest. Price peaks Mon–Wed.\n• **Onion** — Stores well. Hold if price < ₹17, sell above ₹20.\n• **Potato** — Cold-chain required. List quickly for best margins.\n• **Chilli** — Most profitable crop currently! ₹55–60/kg in premium batches.\n\nNeed price history for a specific crop? Just ask!`,
  },
  {
    keywords: ['payment', 'upi', 'bank', 'money', 'rupee', 'paid', 'earning'],
    response: () =>
      `💰 **Payment & Earnings**\n\nKisanConnect guarantees:\n• **Direct UPI transfer** within 24–48 hrs of pickup\n• **Zero commission** on your first 3 listings\n• 2.5% platform fee after that (lowest in the market)\n\nYour earnings are visible in the dashboard chips below the listing form. Need to raise a payment dispute? Say "raise dispute".`,
  },
  {
    keywords: ['dispute', 'problem', 'issue', 'complaint', 'wrong', 'error'],
    response: () =>
      `🛠️ **Raise a Support Ticket**\n\nTo resolve an issue:\n1. Describe the problem clearly\n2. Include your lot ID (shown in Active Lots section)\n3. We'll assign a support agent within **2 hours**\n\n📞 Nashik Farmer Helpline: **1800-123-4567** (Free, 24×7)\n📧 farmers@kisanconnect.in`,
  },
  {
    keywords: ['hello', 'hi', 'namaste', 'hey', 'help', 'start', 'what can you do'],
    response: () =>
      `🌿 **Namaste! I'm KisanConnect AI Assistant**\n\nI can help you with:\n• 💰 Crop prices & market rates\n• 📦 How to list your produce\n• 🚚 Logistics & pickup info\n• 🌦️ Weather & storage tips\n• 🏢 Matching you with buyers\n• 💳 Payments & earnings\n\nJust type your question in **English, हिंदी, or मराठी**!`,
  },
  {
    keywords: ['quality', 'grade', 'a grade', 'fresh', 'organic'],
    response: () =>
      `⭐ **Grading & Quality Standards**\n\nKisanConnect supports 3 quality tiers:\n• **Grade A** — Fresh, uniform size, no blemishes → Premium price (+20%)\n• **Grade B** — Minor imperfections → Standard rate\n• **Processing Grade** — For juice/paste factories → Bulk pricing\n\nMention your grade when listing. Our AI will match you with appropriate buyers.`,
  },
];

const FALLBACK_RESPONSES = [
  "🤔 I'm still learning! For that specific query, please contact our **Nashik Farmer Support** at 1800-123-4567.",
  "📋 That's a great question! I'd suggest listing your produce now and our team will follow up within 2 hours.",
  "🌾 I don't have a specific answer for that yet, but you can always visit the **KisanConnect Help Center** or ask our team directly.",
];

const QUICK_PROMPTS = [
  { label: '💰 Crop prices', query: 'What are current crop prices?' },
  { label: '📦 How to list?', query: 'How do I list my produce?' },
  { label: '🚚 Pickup time?', query: 'When will pickup happen?' },
  { label: '🏢 Find buyers', query: 'Who are the active buyers today?' },
];

/* ─────────────────────────────────────────────────────────────────
   Message Bubble Component
───────────────────────────────────────────────────────────────── */
function MessageBubble({ msg }) {
  const isBot = msg.role === 'bot';

  // Render markdown-like bold (**text**) inline
  const renderText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} style={{ color: isBot ? '#0D7A51' : 'inherit', fontWeight: 700 }}>{part}</strong> : part
    );
  };

  return (
    <div className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end flex-row-reverse'}`}>
      {/* Avatar */}
      {isBot && (
        <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[0.7rem]"
          style={{ background: 'linear-gradient(135deg,#0F9361,#0D7A51)', boxShadow: '0 2px 8px rgba(13,122,81,0.3)' }}>
          ✦
        </div>
      )}

      {/* Bubble */}
      <div
        className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[0.82rem] leading-relaxed whitespace-pre-line"
        style={isBot ? {
          background: '#F0F8F4',
          border: '1px solid rgba(13,122,81,0.12)',
          color: '#0F172A',
          borderBottomLeftRadius: '4px',
        } : {
          background: 'linear-gradient(135deg,#0F9361,#0D7A51)',
          color: 'white',
          borderBottomRightRadius: '4px',
          boxShadow: '0 3px 12px rgba(13,122,81,0.25)',
        }}
      >
        {msg.text.split('\n').map((line, i) => (
          <span key={i}>
            {renderText(line)}
            {i < msg.text.split('\n').length - 1 && <br />}
          </span>
        ))}
        <div className={`text-[0.65rem] mt-1.5 ${isBot ? 'text-gray-400' : 'text-white/60'}`}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Typing Indicator
───────────────────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-2.5 items-start">
      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[0.7rem]"
        style={{ background: 'linear-gradient(135deg,#0F9361,#0D7A51)' }}>
        ✦
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-[4px]"
        style={{ background: '#F0F8F4', border: '1px solid rgba(13,122,81,0.12)' }}>
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#0D7A51]"
              style={{ animation: `chatDot 1.3s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main AI Chatbot Component
───────────────────────────────────────────────────────────────── */
export default function AIChatbot() {
  const { aiPrice } = useAppContext();
  const [isOpen,   setIsOpen]   = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: 'नमस्ते! 🌿 I\'m the **KisanConnect AI Assistant**.\n\nAsk me anything about crop prices, listings, logistics, or buyer demand. I\'m here to help you get the best from your harvest!',
      time: formatTime(new Date()),
    },
  ]);
  const [input,    setInput]    = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNew,   setHasNew]   = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  function formatTime(date) {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasNew(false);
    }
  }, [isOpen, isMinimized]);

  /* ── AI Response Engine ── */
  const getAIResponse = useCallback((query) => {
    const lower = query.toLowerCase().trim();
    for (const entry of AI_KNOWLEDGE) {
      if (entry.keywords.some(kw => lower.includes(kw))) {
        return entry.response({ aiPrice });
      }
    }
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }, [aiPrice]);

  /* ── Send Message ── */
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isTyping) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: text.trim(),
      time: formatTime(new Date()),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking time (600–1400ms)
    const delay = 600 + Math.random() * 800;
    await new Promise(r => setTimeout(r, delay));

    const responseText = getAIResponse(text);
    const botMsg = {
      id: Date.now() + 1,
      role: 'bot',
      text: responseText,
      time: formatTime(new Date()),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMsg]);

    if (!isOpen) setHasNew(true);
  }, [isTyping, getAIResponse, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* ── Floating Chat Window ── */}
      {isOpen && (
        <div
          id="ai-chatbot-panel"
          className="fixed z-50"
          style={{
            bottom: '90px',
            right: '24px',
            width: '360px',
            maxHeight: isMinimized ? '56px' : '520px',
            display: 'flex',
            flexDirection: 'column',
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid rgba(13,122,81,0.15)',
            boxShadow: '0 16px 48px rgba(13,122,81,0.15), 0 4px 16px rgba(0,0,0,0.1)',
            transition: 'max-height 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease',
            overflow: 'hidden',
          }}
        >
          {/* ── Header ── */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0D7A51 0%, #0F9361 100%)',
              borderRadius: isMinimized ? '18px' : '18px 18px 0 0',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                  ✦
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white"
                  style={{ animation: 'chatPulse 2s ease-in-out infinite' }}
                />
              </div>
              <div>
                <p className="text-white font-bold text-[0.85rem] leading-tight">KisanConnect AI</p>
                <p className="text-green-200 text-[0.68rem]">
                  {isTyping ? '✦ Thinking…' : '● Online · Agri Expert'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMinimized(m => !m)}
                className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/25 transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  {isMinimized
                    ? <><polyline points="18 15 12 9 6 15" /></>
                    : <><polyline points="6 9 12 15 18 9" /></>
                  }
                </svg>
              </button>
              <button
                id="chatbot-close-btn"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/25 transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* ── Body (messages) ── */}
          {!isMinimized && (
            <>
              <div
                className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-3"
                style={{ minHeight: 0, scrollbarWidth: 'thin', scrollbarColor: 'rgba(13,122,81,0.2) transparent' }}
              >
                {messages.map(msg => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Quick Prompts ── */}
              {messages.length <= 2 && (
                <div className="px-3.5 pb-2 flex gap-1.5 flex-wrap shrink-0">
                  {QUICK_PROMPTS.map(qp => (
                    <button
                      key={qp.label}
                      onClick={() => sendMessage(qp.query)}
                      className="text-[0.7rem] font-semibold px-2.5 py-1.5 rounded-full transition-all hover:scale-[1.03]"
                      style={{
                        background: '#E6F4EF',
                        color: '#0D7A51',
                        border: '1px solid rgba(13,122,81,0.2)',
                      }}
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Input Bar ── */}
              <form
                onSubmit={handleSubmit}
                className="px-3 pb-3 pt-2 shrink-0 flex gap-2 items-end"
                style={{ borderTop: '1px solid rgba(13,122,81,0.08)' }}
              >
                <textarea
                  ref={inputRef}
                  id="chatbot-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Ask about prices, listings, logistics…"
                  className="flex-1 resize-none text-[0.82rem] outline-none rounded-xl px-3 py-2.5 leading-snug"
                  style={{
                    background: '#F8FAF9',
                    border: '1.5px solid rgba(13,122,81,0.15)',
                    color: '#0F172A',
                    maxHeight: '80px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#0D7A51')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(13,122,81,0.15)')}
                />
                <button
                  type="submit"
                  id="chatbot-send-btn"
                  disabled={!input.trim() || isTyping}
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg,#0F9361,#0D7A51)',
                    boxShadow: '0 4px 12px rgba(13,122,81,0.3)',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* ── Floating Action Button (FAB) ── */}
      <button
        id="ai-chatbot-fab"
        onClick={() => { setIsOpen(o => !o); setHasNew(false); setIsMinimized(false); }}
        className="fixed z-50 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{
          bottom: '24px',
          right: '24px',
          width: isOpen ? '48px' : '56px',
          height: isOpen ? '48px' : '56px',
          borderRadius: '50%',
          background: isOpen
            ? 'linear-gradient(135deg,#374151,#1F2937)'
            : 'linear-gradient(135deg,#0F9361,#0D7A51)',
          boxShadow: isOpen
            ? '0 8px 24px rgba(0,0,0,0.2)'
            : '0 8px 28px rgba(13,122,81,0.45), 0 4px 12px rgba(13,122,81,0.25)',
          border: 'none',
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        title={isOpen ? 'Close chat' : 'Chat with KisanConnect AI'}
      >
        {/* Pulse ring when closed */}
        {!isOpen && (
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: 'rgba(13,122,81,0.35)',
              animation: 'chatFabRing 2.5s ease-out infinite',
            }}
          />
        )}

        {/* New message badge */}
        {hasNew && !isOpen && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#F97316] text-white text-[0.6rem] font-bold flex items-center justify-center border-2 border-white"
            style={{ animation: 'chatBadge 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            1
          </span>
        )}

        {/* Icon */}
        <span className="relative z-10">
          {isOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="rgba(255,255,255,0.15)" />
              <circle cx="9" cy="10" r="1" fill="white" />
              <circle cx="12" cy="10" r="1" fill="white" />
              <circle cx="15" cy="10" r="1" fill="white" />
            </svg>
          )}
        </span>

        {/* Label text when closed */}
        {!isOpen && (
          <span
            className="absolute right-full mr-3 whitespace-nowrap text-[0.75rem] font-bold text-white px-3 py-1.5 rounded-full pointer-events-none"
            style={{
              background: 'linear-gradient(135deg,#0F9361,#0D7A51)',
              boxShadow: '0 4px 12px rgba(13,122,81,0.3)',
              opacity: 0,
              animation: 'chatLabelPeek 4s ease 2s forwards',
            }}
          >
            ✦ AI Assistant
          </span>
        )}
      </button>

      {/* ── Keyframe styles injected via a style tag ── */}
      <style>{`
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes chatPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes chatFabRing {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes chatBadge {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
        @keyframes chatLabelPeek {
          0% { opacity: 0; transform: translateX(8px); }
          10% { opacity: 1; transform: translateX(0); }
          80% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(8px); }
        }
        #ai-chatbot-panel {
          animation: chatPanelIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes chatPanelIn {
          0% { opacity: 0; transform: scale(0.88) translateY(16px); transform-origin: bottom right; }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}
