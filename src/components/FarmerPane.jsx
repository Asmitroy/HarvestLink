import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppContext, calculateRecommendedPrice } from '../context/AppContext';
import VoiceOverlay from './modals/VoiceOverlay';

const CROPS = [
  { value: 'tomato',  label: '🍅 Tomato',  name: 'Tomato'  },
  { value: 'onion',   label: '🧅 Onion',   name: 'Onion'   },
  { value: 'potato',  label: '🥔 Potato',  name: 'Potato'  },
  { value: 'wheat',   label: '🌾 Wheat',   name: 'Wheat'   },
  { value: 'chilli',  label: '🌶 Chilli',  name: 'Chilli'  },
  { value: 'brinjal', label: '🍆 Brinjal', name: 'Brinjal' },
];

export default function FarmerPane({ voiceCrop, voiceQty, clearVoice, onVoice, onEdit }) {
  const { addListing, addToast, aiPrice, setAiPrice, produceListings } = useAppContext();

  // ── Local form state ──
  const [crop,        setCrop]        = useState('tomato');
  const [qty,         setQty]         = useState('50');
  const [isListing,   setListing]     = useState(false);
  const [flashInput,  setFlashInput]  = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceOpen,   setVoiceOpen]   = useState(false);
  const [priceFlash,  setPriceFlash]  = useState(false);

  // ── Dynamic Pricing Engine Calculation ──
  useEffect(() => {
    const newPrice = calculateRecommendedPrice(crop, qty);
    if (newPrice !== aiPrice) {
      setAiPrice(newPrice);
      setPriceFlash(true);
      const t = setTimeout(() => setPriceFlash(false), 700);
      return () => clearTimeout(t);
    }
  }, [crop, qty, setAiPrice, aiPrice]);

  // Apply voice props if passed from parent
  useEffect(() => {
    if (voiceCrop) setCrop(voiceCrop);
    if (voiceQty)  setQty(String(voiceQty));
    if (voiceCrop || voiceQty) clearVoice();
  }, [voiceCrop, voiceQty, clearVoice]);

  // ── Optimized: Memoized Crop metadata ──
  const selectedCrop = useMemo(() => {
    return CROPS.find(c => c.value === crop) || CROPS[0];
  }, [crop]);

  const cropEmoji = useMemo(() => {
    return selectedCrop.label.split(' ')[0];
  }, [selectedCrop]);

  // ── Optimized: Memoized Active Lots & Earnings ──
  const myLots = useMemo(() => {
    return produceListings.slice(0, 2);
  }, [produceListings]);

  const weeklyEarnings = useMemo(() => {
    const total = produceListings.reduce((s, l) => s + (l.qty || 0) * (l.price || 0), 0);
    return (total / 1000).toFixed(1);
  }, [produceListings]);

  // ── Optimized: Stable Handlers ──
  const handleVoiceClick = useCallback(() => {
    setVoiceOpen(true);
  }, []);

  const handleVoiceRecognized = useCallback((crop, qty) => {
    setVoiceOpen(false);
    setIsRecording(false);
    if (crop) setCrop(crop);
    if (qty)  setQty(String(qty));
    addToast(`🎙️ Voice: "${qty ? qty + 'kg ' : ''}${crop ? crop.charAt(0).toUpperCase() + crop.slice(1) : ''}" — fields filled!`, 'success');
  }, [addToast]);

  const handleList = useCallback(async () => {
    const qtyNum = parseFloat(qty);
    if (!qty || isNaN(qtyNum) || qtyNum < 1) {
      addToast('⚠️ Please enter a valid quantity', 'error');
      return;
    }

    setListing(true);
    try {
      await addListing({ crop: selectedCrop.name, qty: qtyNum, price: aiPrice });
      setQty('');
      setFlashInput(true);
      setTimeout(() => setFlashInput(false), 800);
    } catch (err) {
      console.error('[handleList]', err);
      addToast(`❌ Failed to list produce: ${err.message}`, 'error');
    } finally {
      setListing(false);
    }
  }, [qty, selectedCrop.name, aiPrice, addListing, addToast]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0D7A51] flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <h2 className="text-[0.95rem] font-bold text-gray-900 leading-tight">Direct Farm Gate Listing</h2>
            <p className="text-[0.72rem] text-gray-500">Supply Node · Nashik District</p>
          </div>
        </div>
        <span className="text-[0.65rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
          style={{ background:'#E6F4EF', color:'#0D7A51', borderColor:'rgba(13,122,81,0.15)' }}>Live</span>
      </div>

      {/* Voice-to-Text Card with Voice Simulation */}
      <div className={`rounded-2xl border flex flex-col items-center gap-3 p-5 transition-all duration-300 ${
        isRecording
          ? 'bg-red-50/90 border-red-300 shadow-md'
          : 'bg-gradient-to-br from-[#E6F4EF] to-[#f0fff4] border-[#0D7A51]/15'
      }`}>
        <button
          id="voice-btn"
          onClick={handleVoiceClick}
          className="relative w-20 h-20 flex items-center justify-center cursor-pointer"
        >
          {isRecording ? (
            <>
              <span className="absolute inset-0 rounded-full bg-red-400 opacity-75 animate-ping" />
              <span className="absolute -inset-2 rounded-full bg-red-200 opacity-50 animate-pulse" />
            </>
          ) : (
            <>
              <span className="voice-ring voice-ring-1" />
              <span className="voice-ring voice-ring-2" />
              <span className="voice-ring voice-ring-3" />
            </>
          )}
          <div
            className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-300 ${
              isRecording
                ? 'bg-red-600 shadow-[0_6px_20px_rgba(220,38,38,0.4)] animate-pulse'
                : 'bg-gradient-to-br from-[#0F9361] to-[#0D7A51] shadow-[0_6px_20px_rgba(13,122,81,0.35)]'
            }`}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="23" x2="16" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </button>

        <p className={`text-[0.84rem] font-bold text-center transition-colors ${
          isRecording ? 'text-red-700 font-extrabold animate-pulse' : 'text-[#0D7A51]'
        }`}>
          {isRecording ? "Listening… 'I want to sell 100kg of tomatoes'" : "Tap to speak your produce"}
        </p>
        <p className="text-[0.7rem] text-gray-500">भाषा: हिंदी, English, मराठी</p>
      </div>

      {/* OR */}
      <div className="flex items-center gap-2.5">
        <span className="flex-1 h-px bg-gray-200" />
        <span className="text-[0.72rem] text-gray-400 font-medium">or enter manually</span>
        <span className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Crop + Qty */}
      <div className="flex gap-2.5">
        <div className="flex flex-col gap-1.5 flex-[1.2]">
          <label className="text-[0.72rem] font-semibold text-gray-500" htmlFor="crop-select">🌾 Crop</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[0.95rem]">{cropEmoji}</span>
            <select
              id="crop-select"
              value={crop}
              onChange={e => setCrop(e.target.value)}
              className="w-full bg-gray-50 border-[1.5px] border-gray-200 rounded-xl pl-8 pr-8 py-2.5 text-[0.84rem] font-semibold text-gray-900 appearance-none outline-none focus:border-[#0D7A51] focus:ring-2 focus:ring-[#0D7A51]/10 transition-all cursor-pointer"
            >
              {CROPS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[0.72rem] font-semibold text-gray-500" htmlFor="qty-input">⚖️ Quantity</label>
          <div className="relative">
            <input
              id="qty-input"
              type="number" min="1"
              value={qty}
              onChange={e => setQty(e.target.value)}
              className={`w-full border-[1.5px] border-gray-200 rounded-xl pl-3 pr-10 py-2.5 text-[0.84rem] font-semibold text-gray-900 outline-none focus:border-[#0D7A51] focus:ring-2 focus:ring-[#0D7A51]/10 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none ${
                flashInput
                  ? 'bg-[#E6F4EF] border-[#0D7A51]'
                  : 'bg-gray-50'
              }`}
              placeholder="kg"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.72rem] font-semibold text-gray-400">kg</span>
          </div>
        </div>
      </div>

      {/* HarvestLink AI Dynamic Price Card */}
      <div className={`rounded-2xl border p-3.5 flex items-center justify-between transition-all duration-300 ${
        priceFlash
          ? 'bg-emerald-100 border-[#0D7A51] scale-[1.02] shadow-md ring-2 ring-[#0D7A51]/20'
          : 'bg-gradient-to-br from-[#f0fdf4] to-white border-[#0D7A51]/15'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="text-base font-bold text-[#0D7A51]">✦</span>
          <div>
            <p className="text-[0.72rem] font-semibold text-[#0D7A51]">HarvestLink AI Recommended Price</p>
            <p className="text-[1.6rem] font-extrabold text-[#0D7A51] leading-none">
              ₹{aiPrice}<span className="text-[0.75rem] font-semibold text-gray-500">/kg</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            {parseFloat(qty) >= 100 ? '+15% Bulk Premium' : '+12% vs yesterday'}
          </span>
          <button id="ai-edit-btn" onClick={onEdit}
            className="flex items-center gap-1 text-[0.72rem] font-bold px-2.5 py-1 rounded-lg border border-[#0D7A51] text-[#0D7A51] hover:bg-[#0D7A51] hover:text-white transition-all">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
        </div>
      </div>

      {/* List CTA */}
      <button
        id="list-btn"
        onClick={handleList}
        disabled={isListing}
        className="cta-orange w-full rounded-2xl py-3.5 text-[0.9rem] font-bold text-white flex items-center justify-center gap-2.5 transition-all active:scale-[0.97] disabled:opacity-80 disabled:cursor-not-allowed"
        style={{ background:'linear-gradient(135deg,#fb923c,#F97316,#EA580C)' }}
      >
        {isListing ? (
          <>
            <svg className="solver-ring w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Listing…
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            List Produce Now
          </>
        )}
      </button>

      {/* Active Lots */}
      <div className="section-divider">Your Active Lots <span className="ml-1.5 text-[0.65rem] bg-[#E6F4EF] text-[#0D7A51] px-2 py-px rounded-full font-bold">{produceListings.length}</span></div>

      <div className="flex flex-col gap-2">
        {myLots.map(lot => {
          const pct = lot.status === 'assigned' ? 65 : lot.status === 'listed' ? 90 : 20;
          const badgeClass = lot.status === 'assigned' ? 'bg-blue-50 text-blue-600' : lot.status === 'listed' ? 'bg-[#E6F4EF] text-[#0D7A51]' : 'bg-yellow-50 text-yellow-700';
          const badgeText = lot.status === 'assigned' ? 'Assigned to Route #4' : lot.status === 'listed' ? '✅ Just Listed' : 'Pending Pickup';
          const emoji = { Tomato:'🍅', Onion:'🧅', Potato:'🥔', Wheat:'🌾', Chilli:'🌶', Brinjal:'🍆' }[lot.crop] || '🌿';
          return (
            <div key={lot.id} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 hover:border-[#0D7A51]/25 transition-colors">
              <span className="text-[1.3rem]">{emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[0.84rem] font-semibold text-gray-900">{lot.qty}kg {lot.crop}</p>
                <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block ${badgeClass}`}>{badgeText}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#0F9361] to-[#0D7A51] transition-all duration-700" style={{ width:`${pct}%` }} />
                </div>
                <span className="text-[0.68rem] font-bold text-[#0D7A51]">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Earnings */}
      <div className="flex gap-2">
        {[
          { icon:'₹', label:'This Week',   value:`₹${weeklyEarnings}k` },
          { icon:'↑', label:'Avg Premium', value:'+₹3.2/kg' },
        ].map(chip => (
          <div key={chip.label} className="flex-1 flex items-center gap-2 rounded-xl border px-3 py-2.5"
            style={{ background:'#E6F4EF', borderColor:'rgba(13,122,81,0.15)' }}>
            <span className="text-[0.8rem] font-bold text-[#0D7A51]">{chip.icon}</span>
            <div>
              <p className="text-[0.65rem] text-gray-500">{chip.label}</p>
              <p className="text-[0.8rem] font-bold text-[#0D7A51]">{chip.value}</p>
            </div>
          </div>
        ))}
      </div>
      {voiceOpen && (
        <VoiceOverlay
          onClose={() => { setVoiceOpen(false); setIsRecording(false); }}
          onRecognized={handleVoiceRecognized}
        />
      )}

    </div>
  );
}
