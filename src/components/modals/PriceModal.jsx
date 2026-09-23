import { useState } from 'react';

export default function PriceModal({ price, onConfirm, onClose }) {
  const [val, setVal] = useState(price);

  const confirm = () => {
    const p = parseFloat(val);
    if (!p || p < 1) return;
    onConfirm(p);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/45 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="panel-in bg-white rounded-3xl p-7 w-[420px] flex flex-col gap-4"
        style={{ boxShadow:'0 24px 64px rgba(0,0,0,0.15)' }}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-[1.15rem] font-extrabold text-gray-900">Set Your Price</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 text-sm hover:bg-gray-100 transition-colors">
            ✕
          </button>
        </div>

        <p className="text-[0.82rem] text-gray-500 leading-relaxed">
          KisanConnect AI suggests ₹25/kg based on today's Mandi data across 12 nearby markets
        </p>

        {/* Price input */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-5 py-2 border-2 border-[#0D7A51]"
          style={{ boxShadow:'0 0 0 4px rgba(13,122,81,0.08)' }}>
          <span className="text-[1.6rem] font-bold text-[#0D7A51]">₹</span>
          <input
            type="number" min="1"
            value={val}
            onChange={e => setVal(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-[2.6rem] font-extrabold text-[#0D7A51] text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-[1.6rem] font-bold text-[#0D7A51]">/kg</span>
        </div>

        {/* Hint */}
        <div className="flex items-center gap-2 bg-[#E6F4EF] border border-[#0D7A51]/15 rounded-xl p-3 text-[0.78rem] text-[#0D7A51] font-medium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D7A51" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Fair pricing gets you 3× faster buyer matches
        </div>

        {/* Confirm */}
        <button onClick={confirm}
          className="w-full rounded-2xl py-4 text-[0.95rem] font-bold text-white transition-all active:scale-[0.97] hover:opacity-90"
          style={{ background:'linear-gradient(135deg,#0F9361,#0D7A51)', boxShadow:'0 4px 14px rgba(13,122,81,0.3)' }}>
          Apply Price
        </button>
      </div>
    </div>
  );
}
