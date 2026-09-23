'use strict';

/* ══════════════════════════════════════════════════════
   KISANCONNECT — Unified Platform JavaScript
══════════════════════════════════════════════════════ */

/* ── Toast System ── */
const toastStack = document.getElementById('toast-stack');
function showToast(msg, type = 'default') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', default: '🔔' };
  const el = document.createElement('div');
  el.className = 'toast-item';
  el.innerHTML = `<span>${icons[type] || icons.default}</span> ${msg}`;
  toastStack.appendChild(el);
  setTimeout(() => { el.classList.add('hide'); setTimeout(() => el.remove(), 300); }, 3000);
}

/* ── Modal Helpers ── */
function openOverlay(id)  { const el = document.getElementById(id); el.classList.add('active');  el.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
function closeOverlay(id) { const el = document.getElementById(id); el.classList.remove('active'); el.setAttribute('aria-hidden', 'true');  document.body.style.overflow = ''; }
function openModal(id)    { const el = document.getElementById(id); el.classList.add('open');    el.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
function closeModal(id)   { const el = document.getElementById(id); el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }

/* ══════════════════════════════════════════════════════
   PERSONA SWITCHER
══════════════════════════════════════════════════════ */
const tabs = document.querySelectorAll('.persona-tab');
const indicator = document.getElementById('tab-indicator');
const switcher = document.getElementById('persona-switcher');

function positionIndicator(tab) {
  const switcherRect = switcher.getBoundingClientRect();
  const tabRect = tab.getBoundingClientRect();
  indicator.style.left  = (tabRect.left - switcherRect.left) + 'px';
  indicator.style.width = tabRect.width + 'px';
}

// Init indicator on active tab
const activeTab = document.querySelector('.persona-tab.active');
if (activeTab) requestAnimationFrame(() => positionIndicator(activeTab));

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    positionIndicator(tab);

    const persona = tab.dataset.persona;
    document.body.setAttribute('data-persona', persona);

    const messages = {
      farmer:    '🧑‍🌾 Farmer perspective active — Supply node highlighted',
      buyer:     '🏢 Buyer Pool active — Demand aggregator highlighted',
      logistics: '🚚 Logistics Optimizer active — Route engine highlighted',
    };
    showToast(messages[persona] || 'Perspective switched', 'info');
  });
});

// Set initial body persona
document.body.setAttribute('data-persona', 'farmer');

// Reposition on resize
window.addEventListener('resize', () => {
  const at = document.querySelector('.persona-tab.active');
  if (at) positionIndicator(at);
}, { passive: true });

/* ══════════════════════════════════════════════════════
   LIVE MANDI TICKER
══════════════════════════════════════════════════════ */
const mandiCrops = [
  { name: 'Wheat',   price: '₹24/kg', change: '▲1%',  up: true },
  { name: '🍅 Tomato', price: '₹25/kg', change: '▲8%',  up: true },
  { name: '🧅 Onion',  price: '₹18/kg', change: '▲3%',  up: true },
  { name: '🥔 Potato', price: '₹14/kg', change: '▼2%',  up: false },
  { name: '🌶 Chilli',  price: '₹60/kg', change: '▲12%', up: true },
  { name: '🌾 Rice',   price: '₹38/kg', change: '▲0.5%',up: true },
];
let tickerIdx = 0;
const tickerText = document.getElementById('ticker-text');

function rotateTicker() {
  tickerIdx = (tickerIdx + 1) % mandiCrops.length;
  const c = mandiCrops[tickerIdx];
  tickerText.style.opacity = '0';
  tickerText.style.transform = 'translateY(-6px)';
  setTimeout(() => {
    tickerText.innerHTML = `${c.name} ${c.price} <span class="${c.up ? 'up' : 'down'}">${c.change}</span>`;
    tickerText.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    tickerText.style.opacity = '1';
    tickerText.style.transform = 'translateY(0)';
  }, 180);
}
setInterval(rotateTicker, 3500);

/* ══════════════════════════════════════════════════════
   LANGUAGE TOGGLE
══════════════════════════════════════════════════════ */
const langToggle  = document.getElementById('lang-toggle');
const langDisplay = document.getElementById('lang-display');
const langOther   = document.getElementById('lang-other');
let isHindi = false;

langToggle.addEventListener('click', () => {
  isHindi = !isHindi;
  langDisplay.textContent = isHindi ? 'हिंदी' : 'EN';
  langOther.textContent   = isHindi ? 'EN'    : 'हिंदी';
  showToast(isHindi ? '🇮🇳 Hindi mode active' : '🇬🇧 English mode active', 'info');
});

/* ══════════════════════════════════════════════════════
   NOTIFICATIONS
══════════════════════════════════════════════════════ */
document.getElementById('notif-btn').addEventListener('click', () => {
  showToast('🔔 4 new alerts: 3 demand matches + 1 truck departure', 'info');
  document.querySelector('.notif-dot').style.display = 'none';
});

/* ══════════════════════════════════════════════════════
   VOICE LISTING
══════════════════════════════════════════════════════ */
let voiceTimer = null;
document.getElementById('voice-btn').addEventListener('click', () => {
  openOverlay('voice-overlay');
  voiceTimer = setTimeout(() => {
    closeOverlay('voice-overlay');
    document.getElementById('crop-select').value = 'tomato';
    document.getElementById('qty-input').value   = '50';
    showToast('🎙️ Recognized: "50 kg Tomato" — fields filled!', 'success');
  }, 4000);
});
document.getElementById('stop-voice-btn').addEventListener('click',  () => { clearTimeout(voiceTimer); closeOverlay('voice-overlay'); });
document.getElementById('voice-close').addEventListener('click',     () => { clearTimeout(voiceTimer); closeOverlay('voice-overlay'); });
document.getElementById('voice-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) { clearTimeout(voiceTimer); closeOverlay('voice-overlay'); } });

/* ══════════════════════════════════════════════════════
   AI PRICE EDITOR
══════════════════════════════════════════════════════ */
document.getElementById('ai-edit-btn').addEventListener('click', () => openModal('price-backdrop'));
document.getElementById('price-close').addEventListener('click',  () => closeModal('price-backdrop'));
document.getElementById('price-backdrop').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal('price-backdrop'); });

document.getElementById('price-confirm').addEventListener('click', () => {
  const val = parseFloat(document.getElementById('price-input').value);
  if (!val || val < 1) { showToast('⚠️ Enter a valid price', 'error'); return; }
  document.getElementById('ai-price-val').innerHTML = `₹${val}<span>/kg</span>`;
  closeModal('price-backdrop');
  showToast(`✅ AI Price updated to ₹${val}/kg`, 'success');
});

/* ══════════════════════════════════════════════════════
   LIST PRODUCE CTA
══════════════════════════════════════════════════════ */
const listBtn = document.getElementById('list-btn');
listBtn.addEventListener('click', () => {
  const crop = document.getElementById('crop-select').value;
  const qty  = document.getElementById('qty-input').value;
  const price = document.getElementById('price-input').value;

  if (!qty || qty < 1) { showToast('⚠️ Please enter a valid quantity', 'error'); return; }

  const origHTML = listBtn.innerHTML;
  listBtn.innerHTML = `<svg class="spin-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Listing…`;
  listBtn.style.pointerEvents = 'none';
  listBtn.style.animation = 'none';

  const spinSvg = listBtn.querySelector('.spin-svg');
  if (spinSvg) spinSvg.style.animation = 'btnSpin 1s linear infinite';

  setTimeout(() => {
    listBtn.innerHTML = origHTML;
    listBtn.style.pointerEvents = '';
    listBtn.style.animation = '';
    showToast(`🎉 Listed! ${qty}kg ${crop} @ ₹${price}/kg — 38 buyers notified`, 'success');
    // Update AI status
    document.getElementById('ai-status-pill').innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0D7A51" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> AI Matching: <strong>Active</strong>`;
    document.getElementById('ai-status-pill').style.color = 'var(--green-primary)';
  }, 2000);
});

/* ══════════════════════════════════════════════════════
   DEMAND POOL — Join Buttons
══════════════════════════════════════════════════════ */
document.getElementById('join-dc1')?.addEventListener('click', () => {
  showToast('🏪 Joined Tomato Pool! 50kg allocated to this batch', 'success');
  const fill = document.getElementById('dc1-fill');
  const status = document.getElementById('dc1-status');
  if (fill) fill.style.width = '70%';
  if (status) { status.textContent = '70% matched — Filling fast!'; }
  document.querySelector('[aria-label="Join this demand pool"]').textContent = '✅ Joined';
});

document.getElementById('pool-btn').addEventListener('click', () => {
  showToast('🔗 Opening full Aggregation Pool marketplace…', 'info');
});

/* ══════════════════════════════════════════════════════
   AI VEHICLE ROUTING SOLVER
══════════════════════════════════════════════════════ */
const solverBtn    = document.getElementById('solver-btn');
const routeBadge   = document.getElementById('route-badge');
const aiStatusPill = document.getElementById('ai-status-pill');

const solverSteps = [
  'Initializing genetic algorithm…',
  'Loading 247 supply node coordinates…',
  'Calculating pairwise distances…',
  'Running Clarke-Wright savings heuristic…',
  'Applying 2-opt improvement passes…',
  'Validating capacity constraints…',
  'Generating optimal route plan…',
  '✅ Optimal solution found!',
];

solverBtn.addEventListener('click', () => {
  if (solverBtn.classList.contains('running')) return;

  openOverlay('solver-overlay');
  solverBtn.classList.add('running');
  routeBadge.textContent = 'Solving…';
  routeBadge.classList.remove('purple');
  routeBadge.classList.add('orange');
  aiStatusPill.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> AI Routing: <strong>Running</strong>`;

  const progressFill = document.getElementById('solver-progress');
  const stepEl       = document.getElementById('solver-step');

  let step = 0;
  const total = solverSteps.length;

  const stepInterval = setInterval(() => {
    const pct = Math.round(((step + 1) / total) * 100);
    progressFill.style.width = pct + '%';
    stepEl.textContent = solverSteps[step];
    step++;
    if (step >= total) {
      clearInterval(stepInterval);
      setTimeout(() => {
        closeOverlay('solver-overlay');
        solverBtn.classList.remove('running');
        routeBadge.textContent = 'Optimized';
        routeBadge.classList.remove('orange');
        routeBadge.classList.add('green');
        progressFill.style.width = '0%';
        step = 0;
        aiStatusPill.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0D7A51" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> AI Routing: <strong>Optimized ✓</strong>`;
        aiStatusPill.style.color = 'var(--green-primary)';
        // Update load metrics slightly
        document.getElementById('load-pct').textContent = '78%';
        document.getElementById('load-val').textContent = '1,560 / 2,000 kg';
        document.getElementById('load-fill').style.width = '78%';
        showToast('🚀 VRP Solver complete! Route #4 optimized — saving ₹6.50/kg', 'success');
      }, 700);
    }
  }, 600);
});

document.getElementById('solver-overlay')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeOverlay('solver-overlay');
});

/* ══════════════════════════════════════════════════════
   MAP PIN INTERACTIONS
══════════════════════════════════════════════════════ */
const mapPins = {
  'pin-farm1': { label: 'Farm A — Ramesh Patel', detail: '200kg Tomatoes ready · Nashik' },
  'pin-farm2': { label: 'Farm B — Suresh Kumar', detail: '150kg Onions ready · Igatpuri' },
  'pin-farm3': { label: 'Farm C — Priya Devi',   detail: '100kg Potatoes ready · Trimbak' },
  'pin-hub':   { label: 'Nashik Aggregation Hub', detail: 'Capacity: 2,000kg · 2 trucks waiting' },
  'pin-dest':  { label: 'Mumbai Urban Hub',        detail: 'Final destination · 82km away' },
};

Object.entries(mapPins).forEach(([id, info]) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('click', () => showToast(`📍 ${info.label} — ${info.detail}`, 'info'));
});

/* ══════════════════════════════════════════════════════
   PROFILE BUTTON
══════════════════════════════════════════════════════ */
document.getElementById('profile-btn').addEventListener('click', () => {
  showToast('👤 Ramesh Patel · Nashik · 5★ Farmer · ₹42,000 earned this season', 'info');
});

/* ══════════════════════════════════════════════════════
   RADIUS FILTER
══════════════════════════════════════════════════════ */
const radii = ['Within 25km', 'Within 50km', 'Within 100km', 'All Districts'];
let radiusIdx = 1;
document.getElementById('radius-btn').addEventListener('click', function() {
  radiusIdx = (radiusIdx + 1) % radii.length;
  const label = radii[radiusIdx];
  this.childNodes[2].textContent = ' ' + label + ' ';
  showToast(`🔍 Showing demand pool: ${label}`, 'info');
});

/* ══════════════════════════════════════════════════════
   SEARCH BAR — Live filter (basic)
══════════════════════════════════════════════════════ */
document.getElementById('demand-search').addEventListener('input', function() {
  const q = this.value.toLowerCase();
  document.querySelectorAll('.demand-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = (!q || text.includes(q)) ? '' : 'none';
  });
});

/* ══════════════════════════════════════════════════════
   ENTRANCE ANIMATIONS
══════════════════════════════════════════════════════ */
(function initEntranceAnimations() {
  const items = [
    '.pane-left',
    '.pane-mid',
    '.pane-right',
  ];
  items.forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
    requestAnimationFrame(() => setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 50));
  });

  // Status bar counter animation
  setTimeout(() => {
    document.getElementById('ai-status-pill').style.transition = 'color 0.5s';
  }, 800);
})();
