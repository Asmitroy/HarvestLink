import { useState, useEffect } from 'react';
import { PersonaSwitcher } from './PersonaSwitcher';
import { useAppContext } from '../context/AppContext';

const MANDI_ITEMS = [
  { name: 'Wheat',      price: '₹24/kg', change: '▲1%',   up: true  },
  { name: '🍅 Tomato',  price: '₹25/kg', change: '▲8%',   up: true  },
  { name: '🧅 Onion',   price: '₹18/kg', change: '▲3%',   up: true  },
  { name: '🥔 Potato',  price: '₹14/kg', change: '▼2%',   up: false },
  { name: '🌶 Chilli',  price: '₹60/kg', change: '▲12%',  up: true  },
  { name: '🌾 Rice',    price: '₹38/kg', change: '▲0.5%', up: true  },
];

export default function TopNav() {
  // ── Context (no props needed)
  const { activeRole, setActiveRole, addToast } = useAppContext();

  const [tickerIdx,  setTickerIdx]  = useState(0);
  const [tickerFade, setTickerFade] = useState(false);
  const [isHindi,    setIsHindi]    = useState(false);
  const [showNotif,  setShowNotif]  = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setTickerFade(true);
      setTimeout(() => { setTickerIdx(i => (i + 1) % MANDI_ITEMS.length); setTickerFade(false); }, 200);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const ticker = MANDI_ITEMS[tickerIdx];

  const handleSetRole = (role) => {
    setActiveRole(role);
    const messages = {
      farmer:    '🧑‍🌾 Farmer perspective active — Supply node highlighted',
      buyer:     '🏢 Buyer Pool active — Demand aggregator highlighted',
      logistics: '🚚 Fleet & Admin active — Route engine highlighted',
    };
    addToast(messages[role] || 'Perspective switched', 'info');
  };

  return (
    <header className="sticky top-0 z-[200] bg-white/95 border-b border-gray-200 h-16 backdrop-blur-xl"
      style={{ boxShadow: '0 1px 0 #E5E7EB, 0 4px 20px rgba(0,0,0,0.04)' }}>
      <div className="max-w-[1600px] mx-auto px-6 h-full flex items-center gap-6">

        {/* ── Logo ── */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
            style={{ background:'#0D7A51', boxShadow:'0 2px 8px rgba(13,122,81,0.3)' }}>
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
              <path d="M14 5C14 5 7 10.5 7 16.5C7 20.09 10.13 23 14 23C17.87 23 21 20.09 21 16.5C21 10.5 14 5 14 5Z" fill="white" opacity="0.92"/>
              <path d="M14 5C14 5 11 13 14 21" stroke="#0D7A51" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-[1.2rem] font-extrabold tracking-tight"
            style={{ background:'linear-gradient(135deg,#0D7A51,#16a34a)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            KisanConnect
          </span>
          <span className="text-[0.62rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
            style={{ background:'#E6F4EF', color:'#0D7A51', borderColor:'rgba(13,122,81,0.15)' }}>
            Beta
          </span>
        </div>

        {/* ── Persona Switcher (centered) ── */}
        <div className="flex-1 flex justify-center">
          <PersonaSwitcher activeRole={activeRole} setRole={handleSetRole} />
        </div>

        {/* ── Right controls ── */}
        <div className="flex items-center gap-2.5 shrink-0">

          {/* Language toggle */}
          <button
            onClick={() => { setIsHindi(!isHindi); addToast(isHindi ? '🇬🇧 English mode' : '🇮🇳 Hindi mode', 'info'); }}
            className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 transition-colors hover:border-[#0D7A51]"
          >
            <span style={{ color: isHindi ? '#0D7A51' : '#111' }}>{isHindi ? 'हिंदी' : 'EN'}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">{isHindi ? 'EN' : 'हिंदी'}</span>
          </button>

          {/* Mandi Ticker */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[0.78rem] font-semibold overflow-hidden max-w-[190px]"
            style={{ background:'#E6F4EF', borderColor:'rgba(13,122,81,0.15)', color:'#0D7A51' }}>
            <span className="w-2 h-2 rounded-full bg-[#0D7A51] shrink-0 animate-ticker-blink" />
            <span className={`whitespace-nowrap transition-opacity duration-200 ${tickerFade ? 'opacity-0' : 'opacity-100'}`}>
              {ticker.name} {ticker.price}{' '}
              <span className={ticker.up ? 'text-green-600' : 'text-red-500'}>{ticker.change}</span>
            </span>
          </div>

          {/* Notification bell */}
          <button
            id="notif-btn"
            onClick={() => { addToast('🔔 4 new alerts: 3 demand matches + 1 truck departure', 'info'); setShowNotif(false); }}
            className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white hover:text-gray-900 transition-colors"
            aria-label="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {showNotif && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[0.58rem] font-bold rounded-full flex items-center justify-center border-2 border-white">4</span>
            )}
          </button>

          {/* Profile */}
          <button
            id="profile-btn"
            onClick={() => addToast('👤 Ramesh Patel · Nashik · 5★ · ₹42,000 earned this season', 'info')}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#0D7A51] transition-all"
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 3px #E6F4EF'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            style={{ boxShadow: 'none' }}
          >
            <div className="w-8 h-8 rounded-lg bg-[#0D7A51] flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4" fill="white"/>
              </svg>
            </div>
            <div className="flex flex-col gap-0.5 text-left">
              <span className="text-[0.8rem] font-bold leading-none text-gray-900">Ramesh Patel</span>
              <span className="text-[0.68rem] text-gray-500 leading-none">Farmer · Nashik</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>

        </div>
      </div>
    </header>
  );
}
