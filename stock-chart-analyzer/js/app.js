// ─── Main HUD Orchestrator Module ───────────────────────────────────────────────
import { DATASETS, FINANCIALS } from './data.js';
import { ALL_ASSETS } from './assets_db.js';
import { TechnicalChart } from './chart.js';
import { findSupportResistance, analyzeTechnicalScore, predictFutureCorridor } from './analyzer.js';

let chart = null;
let currentData = [];
let currentForecast = [];
let currentTicker = 'NVDA';
let currentTimeframe = 'daily';

const DOM = {
  dropzone: document.getElementById('csv-dropzone'),
  fileInput: document.getElementById('csv-file-input'),
  assetSelector: document.getElementById('asset-selector'),
  terminal: document.getElementById('terminal-logs'),
  
  // Search Inputs
  searchInput: document.getElementById('ticker-search-input'),
  searchBtn: document.getElementById('ticker-search-btn'),
  suggestions: document.getElementById('ticker-suggestions'),

  // Financial Info Display Panel
  companyName: document.getElementById('info-company-name'),
  infoTicker: document.getElementById('info-ticker'),
  infoCurrentPrice: document.getElementById('info-current-price'),
  infoPriceChange: document.getElementById('info-price-change'),
  finPer: document.getElementById('financial-per'),
  finPbr: document.getElementById('financial-pbr'),
  finRoe: document.getElementById('financial-roe'),
  finEps: document.getElementById('financial-eps'),
  finRev: document.getElementById('financial-rev'),
  finInc: document.getElementById('financial-inc'),

  // Right HUD switchable tabs & sections
  rightTabs: document.getElementById('right-hud-tabs'),
  secScore: document.getElementById('right-sec-score'),
  secPivots: document.getElementById('right-sec-pivots'),
  secFactors: document.getElementById('right-sec-factors'),
  secShorts: document.getElementById('right-sec-shorts'),
  secCompany: document.getElementById('right-sec-company'),
  shortsPremiumOverlay: document.getElementById('shorts-premium-overlay'),
  scorePremiumOverlay: document.getElementById('score-premium-overlay'),
  timeframeTabs: document.getElementById('timeframe-tabs'),

  // Shorts HUD elements
  shortsSqueezeProb: document.getElementById('shorts-squeeze-prob'),
  shortsSqueezeAlert: document.getElementById('shorts-squeeze-alert'),
  shortsInterestVol: document.getElementById('shorts-interest-vol'),
  shortsBorrowRate: document.getElementById('shorts-borrow-rate'),
  shortsDaysCover: document.getElementById('shorts-days-cover'),
  shortsFloatPct: document.getElementById('shorts-float-pct'),
  shortsSentimentDesc: document.getElementById('shorts-sentiment-desc'),

  // Company Profile elements
  compCeo: document.getElementById('comp-ceo'),
  compIndustry: document.getElementById('comp-industry'),
  compEmployees: document.getElementById('comp-employees'),
  compFounded: document.getElementById('comp-founded'),
  compDesc: document.getElementById('comp-desc'),

  // 3-Year financial tables
  tableRev23: document.getElementById('table-rev-23'),
  tableRev24: document.getElementById('table-rev-24'),
  tableRev25: document.getElementById('table-rev-25'),
  tableInc23: document.getElementById('table-inc-23'),
  tableInc24: document.getElementById('table-inc-24'),
  tableInc25: document.getElementById('table-inc-25'),
  tableAss23: document.getElementById('table-ass-23'),
  tableAss24: document.getElementById('table-ass-24'),
  tableAss25: document.getElementById('table-ass-25'),
  tableLia23: document.getElementById('table-lia-23'),
  tableLia24: document.getElementById('table-lia-24'),
  tableLia25: document.getElementById('table-lia-25'),
  tableCf23: document.getElementById('table-cf-23'),
  tableCf24: document.getElementById('table-cf-24'),
  tableCf25: document.getElementById('table-cf-25'),

  // AI Dashboard Elements
  gaugeVal: document.getElementById('ai-gauge-value'),
  gaugeGlow: document.getElementById('ai-gauge-glow'),
  badge: document.getElementById('score-badge'),
  resLevels: document.getElementById('res-levels'),
  supLevels: document.getElementById('sup-levels'),
  factorList: document.getElementById('factor-list'),

  // Indicator Switches
  switches: {
    bb: document.getElementById('switch-bb'),
    ema: document.getElementById('switch-ema'),
    sma: document.getElementById('switch-sma'),
    rsi: document.getElementById('switch-rsi'),
    macd: document.getElementById('switch-macd'),
    sr: document.getElementById('switch-sr'),
    forecast: document.getElementById('switch-forecast')
  },

  // Toss Payment Overlay Elements
  jispOverlay: document.getElementById('jisp-payment-overlay'),
  jispClose: document.getElementById('jisp-payment-close'),
  jispSubmit: document.getElementById('jisp-pay-submit-btn'),
  jispAdBanner: document.getElementById('jisp-ad-banner'),
  jispAdUpgradeBtn: document.getElementById('jisp-ad-upgrade-btn'),

  // Auth Overlay Elements
  authOverlay: document.getElementById('jisp-auth-overlay'),
  authClose: document.getElementById('jisp-auth-close'),
  authSubmit: document.getElementById('jisp-auth-submit-btn'),
  authBtn: document.getElementById('portal-auth-btn'),
  authUsernameGroup: document.getElementById('auth-username-group'),
  authUsernameInput: document.getElementById('auth-username-input'),
  authEmailInput: document.getElementById('auth-email-input'),
  authPasswordInput: document.getElementById('auth-password-input'),
  authSwitchAction: document.getElementById('auth-switch-action'),
  authSwitchPrompt: document.getElementById('auth-switch-prompt'),
  authHeaderTitle: document.getElementById('auth-modal-header-title')
};

/* ── Initialization ──────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  addLog('QUANTUM SCANNING CORE LOADER V4.2... ONLINE', 'success');
  addLog('ESTABLISHING SECURE MULTI-INDICATOR PIPELINES...');

  // Initialize Canvas Chart
  const canvas = document.getElementById('chart-canvas');
  chart = new TechnicalChart(canvas);

  // Set default active indicator switches in chart options
  Object.keys(DOM.switches).forEach(key => {
    chart.setIndicator(key, DOM.switches[key].checked);
  });

  // SSO Auth logic
  let authMode = 'login';

  function syncAuth() {
    const userRaw = localStorage.getItem('jisp_user');
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        DOM.authBtn.innerHTML = `👤 ${user.username} <button id="portal-logout-btn" style="background:#ef4444; border:none; color:#fff; border-radius:8px; padding:2px 6px; font-size:9px; cursor:pointer; margin-left:4px; font-weight:700;">OUT</button>`;
        DOM.authBtn.style.background = '#1e293b';
        DOM.authBtn.style.borderColor = '#334155';
        
        const logoutBtn = document.getElementById('portal-logout-btn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            localStorage.removeItem('jisp_user');
            addLog('Signed out of trading account.', 'error');
            syncAuth();
          });
        }
      } catch (e) {
        localStorage.removeItem('jisp_user');
      }
    } else {
      DOM.authBtn.innerHTML = '로그인';
      DOM.authBtn.style.background = '#2563eb';
      DOM.authBtn.style.borderColor = '#2563eb';
    }
  }

  DOM.authBtn.addEventListener('click', () => {
    const userRaw = localStorage.getItem('jisp_user');
    if (!userRaw) {
      DOM.authOverlay.classList.add('active');
    }
  });

  DOM.authClose.addEventListener('click', () => {
    DOM.authOverlay.classList.remove('active');
  });

  function handleAuthSwitch() {
    if (authMode === 'login') {
      authMode = 'register';
      DOM.authHeaderTitle.textContent = '회원가입';
      DOM.authUsernameGroup.style.display = 'flex';
      DOM.authSwitchPrompt.innerHTML = '이미 계정이 있으신가요? <span class="auth-switch-link" id="auth-switch-action" style="color: #3b82f6; font-weight: 700; cursor: pointer;">로그인</span>';
      DOM.authSubmit.textContent = '가입하기';
    } else {
      authMode = 'login';
      DOM.authHeaderTitle.textContent = '로그인';
      DOM.authUsernameGroup.style.display = 'none';
      DOM.authSwitchPrompt.innerHTML = '계정이 없으신가요? <span class="auth-switch-link" id="auth-switch-action" style="color: #3b82f6; font-weight: 700; cursor: pointer;">회원가입</span>';
      DOM.authSubmit.textContent = '로그인';
    }
    const nextBtn = document.getElementById('auth-switch-action');
    if (nextBtn) {
      nextBtn.addEventListener('click', handleAuthSwitch);
    }
  }

  DOM.authSwitchAction.addEventListener('click', handleAuthSwitch);

  DOM.authSubmit.addEventListener('click', () => {
    const email = DOM.authEmailInput.value.trim();
    const pw = DOM.authPasswordInput.value.trim();
    if (!email || !pw) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    DOM.authSubmit.textContent = authMode === 'login' ? '로그인 중...' : '회원가입 중...';
    DOM.authSubmit.disabled = true;

    setTimeout(() => {
      let registeredUsers = [];
      try {
        const raw = localStorage.getItem('jisp_registered_users');
        if (raw) registeredUsers = JSON.parse(raw);
      } catch (e) {
        registeredUsers = [];
      }

      if (authMode === 'register') {
        const username = DOM.authUsernameInput.value.trim() || 'User';
        const exists = registeredUsers.some(u => u.email === email);
        if (exists) {
          alert('이미 가입된 이메일 주소입니다.');
          DOM.authSubmit.disabled = false;
          DOM.authSubmit.textContent = '가입하기';
          return;
        }
        const newUser = { username, email, password: pw };
        registeredUsers.push(newUser);
        localStorage.setItem('jisp_registered_users', JSON.stringify(registeredUsers));

        const user = { username, email, loggedIn: true };
        localStorage.setItem('jisp_user', JSON.stringify(user));
        addLog(`Registered user profile: ${username}`, 'success');
      } else {
        const found = registeredUsers.find(u => u.email === email && u.password === pw);
        if (!found) {
          alert('가입되지 않은 계정이거나 비밀번호가 일치하지 않습니다.');
          DOM.authSubmit.disabled = false;
          DOM.authSubmit.textContent = '로그인';
          return;
        }
        const user = { username: found.username, email, loggedIn: true };
        localStorage.setItem('jisp_user', JSON.stringify(user));
        addLog(`Logged in as: ${found.username}`, 'success');
      }
      DOM.authOverlay.classList.remove('active');
      DOM.authSubmit.disabled = false;
      DOM.authSubmit.textContent = authMode === 'login' ? '로그인' : '가입하기';
      syncAuth();
    }, 1200);
  });

  setInterval(syncAuth, 1000);
  syncAuth();

  // Populate datalist suggestions with all 335 tickers
  if (DOM.suggestions && typeof ALL_ASSETS !== 'undefined') {
    DOM.suggestions.innerHTML = ALL_ASSETS.map(a => `<option value="${a.ticker}">${a.name} (${a.sector})</option>`).join('');
  }

  // Toss Payment modal event handlers
  function syncPremium() {
    const isPremium = localStorage.getItem('jisp_premium') === 'true';
    if (isPremium) {
      if (DOM.jispAdBanner) DOM.jispAdBanner.classList.add('premium-hide');
      if (DOM.shortsPremiumOverlay) DOM.shortsPremiumOverlay.style.display = 'none';
      if (DOM.scorePremiumOverlay) DOM.scorePremiumOverlay.style.display = 'none';
    } else {
      if (DOM.jispAdBanner) DOM.jispAdBanner.classList.remove('premium-hide');
      if (DOM.switches.forecast.checked) {
        DOM.switches.forecast.checked = false;
        chart.setIndicator('forecast', false);
        runTechnicalAnalysis();
      }
      const activeTabBtn = DOM.rightTabs.querySelector('.custom-tab-btn.active');
      const activeTab = activeTabBtn ? activeTabBtn.dataset.tab : '';
      if (activeTab === 'shorts' && DOM.shortsPremiumOverlay) {
        DOM.shortsPremiumOverlay.style.display = 'flex';
      }
      if (activeTab === 'score' && DOM.scorePremiumOverlay) {
        DOM.scorePremiumOverlay.style.display = 'flex';
      }
    }
  }

  window.openCheckout = function() {
    if (DOM.jispOverlay) DOM.jispOverlay.classList.add('active');
  }

  if (DOM.jispAdUpgradeBtn) {
    DOM.jispAdUpgradeBtn.addEventListener('click', window.openCheckout);
  }

  function sendDiscordWebhook(name, email) {
    const webhookUrl = localStorage.getItem('jisp_discord_webhook');
    if (!webhookUrl) return Promise.resolve();

    const payload = {
      username: "JISP 결제 알리미",
      embeds: [{
        title: "🔔 JISP Pro 새로운 입금 확인 신청!",
        color: 5814783,
        fields: [
          { name: "👤 입금자명", value: name, inline: true },
          { name: "📧 이메일", value: email, inline: true },
          { name: "💰 신청 금액", value: "₩3,900", inline: true },
          { name: "📅 신청 시간", value: new Date().toLocaleString("ko-KR"), inline: false }
        ],
        footer: { text: "JISP Payment System" }
      }]
    };

    return fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.error('Discord Webhook Error:', err));
  }

  if (DOM.jispSubmit) {
    DOM.jispSubmit.addEventListener('click', () => {
      const nameInput = document.getElementById('toss-sender-name');
      const emailInput = document.getElementById('toss-sender-email');
      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      if (!name || !email) {
        alert('입금자명과 이메일 주소를 입력해주세요.');
        return;
      }
      
      DOM.jispSubmit.textContent = '송금 입금 내역 확인 중...';
      DOM.jispSubmit.disabled = true;

      localStorage.setItem('jisp_pay_origin', window.location.href);
      localStorage.setItem('jisp_current_pending_email', email);
      localStorage.setItem('jisp_premium', 'false');

      fetch('/api/payment/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      })
      .then(res => res.json())
      .then(() => {
        sendDiscordWebhook(name, email).then(() => {
          setTimeout(() => {
            window.location.replace('/payment/pending.html');
          }, 1000);
        });
      })
      .catch(err => {
        console.error(err);
        alert('서버 통신 실패. 백엔드가 실행 중인지 확인하세요.');
        DOM.jispSubmit.disabled = false;
        DOM.jispSubmit.textContent = '송금 완료 확인 신청';
      });
    });
  }

  const payMethodBtns = document.querySelectorAll('.jisp-payment-btn');
  payMethodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      payMethodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  setInterval(syncPremium, 1000);
  syncPremium();

  // Init Data and Analyze default NVDA Ticker
  loadAsset(currentTicker);

  // Bind UI Events
  _bindEvents();
  addLog('SYSTEM READY. SELECT AN ASSET OR USE REAL-TIME PREDICTOR.', 'success');
});

/* ── Events Binding ──────────────────────── */
function _bindEvents() {
  // Right HUD Tab Click events
  DOM.rightTabs.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.custom-tab-btn');
    if (!tabBtn) return;

    // Toggle active state
    DOM.rightTabs.querySelectorAll('.custom-tab-btn').forEach(btn => btn.classList.remove('active'));
    tabBtn.classList.add('active');

    // Toggle display of sections
    const activeTab = tabBtn.dataset.tab;
    DOM.secScore.style.display = activeTab === 'score' ? 'flex' : 'none';
    DOM.secPivots.style.display = activeTab === 'pivots' ? 'flex' : 'none';
    DOM.secFactors.style.display = activeTab === 'factors' ? 'flex' : 'none';
    DOM.secShorts.style.display = activeTab === 'shorts' ? 'flex' : 'none';
    DOM.secCompany.style.display = activeTab === 'company' ? 'flex' : 'none';

    if (activeTab === 'shorts') {
      const isPremium = localStorage.getItem('jisp_premium') === 'true';
      DOM.shortsPremiumOverlay.style.display = isPremium ? 'none' : 'flex';
    }
    if (activeTab === 'score') {
      const isPremium = localStorage.getItem('jisp_premium') === 'true';
      DOM.scorePremiumOverlay.style.display = isPremium ? 'none' : 'flex';
    }
    
    addLog(`SWITCHED RIGHT HUD PANEL TO: [${activeTab.toUpperCase()}]`);
  });

  // Timeframe Tab Click events
  DOM.timeframeTabs.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.custom-tab-btn');
    if (!tabBtn || tabBtn.classList.contains('active')) return;

    // Toggle active state
    DOM.timeframeTabs.querySelectorAll('.custom-tab-btn').forEach(btn => btn.classList.remove('active'));
    tabBtn.classList.add('active');

    const tf = tabBtn.dataset.tf;
    currentTimeframe = tf;
    addLog(`SWITCHED TIMEFRAME TO: [${tf.toUpperCase()}]`);
    loadAsset(currentTicker);
  });

  // Search Button Link Click
  DOM.searchBtn.addEventListener('click', () => {
    const q = DOM.searchInput.value.trim().toUpperCase();
    if (q) loadAsset(q);
  });

  // Search Input Enter keydown
  DOM.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = DOM.searchInput.value.trim().toUpperCase();
      if (q) loadAsset(q);
    }
  });

  // Preloaded list clicks
  DOM.assetSelector.addEventListener('click', (e) => {
    const item = e.target.closest('.asset-item');
    if (!item || item.classList.contains('active')) return;

    // Switch active state
    document.querySelectorAll('.asset-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');

    const ticker = item.dataset.ticker;
    currentTicker = ticker;
    loadAsset(ticker);
  });

  // Checkbox Switches
  Object.keys(DOM.switches).forEach(key => {
    DOM.switches[key].addEventListener('change', (e) => {
      if (key === 'forecast' && localStorage.getItem('jisp_premium') !== 'true') {
        e.target.checked = false;
        chart.setIndicator(key, false);
        addLog('👑 AI Forecast는 JISP Pro 전용 기능입니다. 가입이 필요합니다.', 'warning');
        if (window.openCheckout) window.openCheckout();
        return;
      }
      chart.setIndicator(key, e.target.checked);
      addLog(`Indicator HUD Layer [${key.toUpperCase()}] is now ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
      
      // If we toggled forecast or S/R, re-run analysis to set chart parameters
      if (key === 'forecast' || key === 'sr') {
        runTechnicalAnalysis();
      }
    });
  });

  // CSV Drag and Drop
  DOM.dropzone.addEventListener('click', () => DOM.fileInput.click());

  DOM.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      parseCSV(e.target.files[0]);
    }
  });

  DOM.dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.dropzone.style.borderColor = 'var(--neon-cyan)';
    DOM.dropzone.style.background = 'rgba(6, 182, 212, 0.1)';
  });

  DOM.dropzone.addEventListener('dragleave', () => {
    DOM.dropzone.style.borderColor = 'var(--border-color)';
    DOM.dropzone.style.background = 'rgba(6, 182, 212, 0.02)';
  });

  DOM.dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.dropzone.style.borderColor = 'var(--border-color)';
    DOM.dropzone.style.background = 'rgba(6, 182, 212, 0.02)';
    
    if (e.dataTransfer.files.length > 0) {
      parseCSV(e.dataTransfer.files[0]);
    }
  });
}

function generateSimulatedDaily(ticker, basePrice, isCrypto = false) {
  let h = 0;
  for (let i = 0; i < ticker.length; i++) {
    h = Math.imul(31, h) + ticker.charCodeAt(i) | 0;
  }
  const random = () => {
    h = Math.sin(h) * 10000;
    return h - Math.floor(h);
  };

  const vol = isCrypto ? (0.035 + random() * 0.045) : (0.015 + random() * 0.025);
  const days = 120;
  const data = [];
  let price = basePrice;
  
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (!isCrypto && (d.getDay() === 0 || d.getDay() === 6)) continue;

    const dateStr = d.toISOString().split('T')[0];
    const open = price;
    
    const dailyReturn = (random() - 0.485) * vol * 2.0;
    const close = Math.max(0.01, open * (1 + dailyReturn));
    const high = Math.max(open, close) * (1 + random() * vol * 0.5);
    const low = Math.min(open, close) * (1 - random() * vol * 0.5);
    const volume = Math.floor(100000 + random() * 5000000);

    data.push({
      date: dateStr,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume
    });
    price = close;
  }
  return data;
}

function aggregateData(dailyData, size) {
  const result = [];
  for (let i = 0; i < dailyData.length; i += size) {
    const chunk = dailyData.slice(i, i + size);
    if (chunk.length === 0) continue;
    
    const open = chunk[0].open;
    const close = chunk[chunk.length - 1].close;
    const high = Math.max(...chunk.map(c => c.high));
    const low = Math.min(...chunk.map(c => c.low));
    const volume = chunk.reduce((sum, c) => sum + c.volume, 0);
    const date = chunk[chunk.length - 1].date;

    result.push({ date, open, high, low, close, volume });
  }
  return result;
}

function generateYearlyData(ticker, basePrice, isCrypto = false) {
  let h = 0;
  for (let i = 0; i < ticker.length; i++) {
    h = Math.imul(31, h) + ticker.charCodeAt(i) | 0;
  }
  const random = () => {
    h = Math.sin(h) * 10000;
    return h - Math.floor(h);
  };

  const vol = isCrypto ? 0.25 : 0.12;
  const years = 15;
  const data = [];
  let price = basePrice;
  const currentYear = new Date().getFullYear();

  for (let i = years; i >= 0; i--) {
    const year = currentYear - i;
    const open = price;
    const annualReturn = (random() - 0.45) * vol * 2.0;
    const close = Math.max(0.01, open * (1 + annualReturn));
    const high = Math.max(open, close) * (1 + random() * vol * 0.5);
    const low = Math.min(open, close) * (1 - random() * vol * 0.5);
    const volume = Math.floor(10000000 + random() * 500000000);

    data.push({
      date: `${year}-12-31`,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume
    });
    price = close;
  }
  return data;
}

function generateIntradayData(ticker, basePrice, type, isCrypto = false) {
  let h = 0;
  for (let i = 0; i < ticker.length; i++) {
    h = Math.imul(31, h) + ticker.charCodeAt(i) | 0;
  }
  const random = () => {
    h = Math.sin(h) * 10000;
    return h - Math.floor(h);
  };

  const vol = type === 'tick' ? 0.001 : 0.003;
  const count = 100;
  const data = [];
  let price = basePrice;
  const now = new Date();

  for (let i = count; i >= 0; i--) {
    const d = new Date(now);
    if (type === 'tick') {
      d.setSeconds(d.getSeconds() - i);
    } else {
      d.setMinutes(d.getMinutes() - i * 15);
    }

    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: type === 'tick' ? '2-digit' : undefined });
    const open = price;
    const returnVal = (random() - 0.5) * vol * 2.0;
    const close = Math.max(0.01, open * (1 + returnVal));
    const high = Math.max(open, close) * (1 + random() * vol * 0.3);
    const low = Math.min(open, close) * (1 - random() * vol * 0.3);
    const volume = Math.floor(5000 + random() * 100000);

    data.push({
      date: timeStr,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume
    });
    price = close;
  }
  return data;
}

/* ── Data Loaders & Calculations ─────────── */
function parseYahooFinanceData(resData, timeframe) {
  const chartResult = resData.chart?.result?.[0];
  if (!chartResult) throw new Error("No chart data returned from Yahoo Finance");

  const timestamps = chartResult.timestamp || [];
  const indicators = chartResult.indicators?.quote?.[0] || {};
  const opens = indicators.open || [];
  const highs = indicators.high || [];
  const lows = indicators.low || [];
  const closes = indicators.close || [];
  const volumes = indicators.volume || [];
  const adjCloses = chartResult.indicators?.adjclose?.[0]?.adjclose || [];

  const candles = [];
  const yearlyBuckets = timeframe === 'yearly' ? {} : null;

  for (let i = 0; i < timestamps.length; i++) {
    if (i >= opens.length || i >= highs.length || i >= lows.length || i >= closes.length) continue;
    const ts = timestamps[i];
    let o = opens[i];
    let h = highs[i];
    let l = lows[i];
    let c = closes[i];
    let v = volumes[i] !== null ? volumes[i] : 0;
    const ac = adjCloses[i] !== undefined ? adjCloses[i] : c;

    if (o === null || h === null || l === null || c === null) continue;
    
    if (ac !== null && c > 0 && Math.abs(ac - c) > 0.001) {
      const ratio = ac / c;
      o *= ratio;
      h *= ratio;
      l *= ratio;
      c = ac;
      v = v > 0 ? Math.floor(v / ratio) : 0;
    }

    const dt = new Date(ts * 1000);

    let dateStr = '';
    if (timeframe === 'minute' || timeframe === 'tick') {
      dateStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: timeframe === 'tick' ? '2-digit' : undefined });
    } else {
      dateStr = dt.toISOString().split('T')[0];
    }

    if (timeframe === 'yearly') {
      const year = dt.getFullYear();
      if (!yearlyBuckets[year]) yearlyBuckets[year] = [];
      yearlyBuckets[year].push({ open: o, high: h, low: l, close: c, volume: v, date: dateStr });
    } else {
      candles.push({
        date: dateStr,
        open: +o.toFixed(2),
        high: +h.toFixed(2),
        low: +l.toFixed(2),
        close: +c.toFixed(2),
        volume: v
      });
    }
  }

  if (timeframe === 'yearly') {
    const sortedYears = Object.keys(yearlyBuckets).sort();
    for (const year of sortedYears) {
      const chunk = yearlyBuckets[year];
      if (chunk.length === 0) continue;
      const o = chunk[0].open;
      const c = chunk[chunk.length - 1].close;
      const h = Math.max(...chunk.map(item => item.high));
      const l = Math.min(...chunk.map(item => item.low));
      const v = chunk.reduce((sum, item) => sum + item.volume, 0);

      candles.push({
        date: `${year}-12-31`,
        open: +o.toFixed(2),
        high: +h.toFixed(2),
        low: +l.toFixed(2),
        close: +c.toFixed(2),
        volume: v
      });
    }
  }

  return candles;
}

async function loadAsset(ticker) {
  const searchKey = ticker.trim().toUpperCase();
  const isPreloaded = ['NVDA', 'TSLA', 'BTC'].includes(searchKey);
  
  // Find meta by ticker code or partial/full company name
  const meta = ALL_ASSETS.find(a => 
    a.ticker === searchKey || 
    a.name.toUpperCase().includes(searchKey) ||
    (a.ticker.includes(searchKey) && searchKey.length >= 3)
  );
  
  if (!isPreloaded && !meta) {
    addLog(`SEARCH FAILED: ASSET [${ticker}] NOT LISTED ON EXCHANGE BOARDS.`, 'error');
    alert(`🚨 Search Error:\n"${ticker}" is not found in the listed US or Korean exchanges.`);
    DOM.searchInput.value = currentTicker;
    return;
  }

  // Resolve actual ticker code
  const resolvedTicker = isPreloaded ? searchKey : meta.ticker;

  addLog(`SELECTING ASSET CORE [${resolvedTicker}]... INITIALIZING READING PIPELINE...`);
  DOM.searchInput.value = resolvedTicker;
  currentTicker = resolvedTicker;

  // 1. Establish metadata
  let name = resolvedTicker + ' Corp.';
  let sector = 'Technology';
  let basePrice = 100;
  let isCrypto = false;
  let isKR = false;

  // Check preloaded first
  if (resolvedTicker === 'NVDA') { name = 'Nvidia Corporation'; sector = 'Technology'; basePrice = 910.5; }
  else if (resolvedTicker === 'TSLA') { name = 'Tesla Inc.'; sector = 'Consumer'; basePrice = 175.5; }
  else if (resolvedTicker === 'BTC') { name = 'Bitcoin (Crypto Asset)'; sector = 'Crypto'; basePrice = 68000; isCrypto = true; }
  else if (meta) {
    name = meta.name;
    sector = meta.sector;
    basePrice = meta.basePrice;
    isCrypto = sector === 'Crypto';
    isKR = /^\d{6}$/.test(resolvedTicker);
  }

  // 2. High-speed Instant Chart Generation (0.01s instant display)
  if (chart) {
    chart.isLoading = false;
  }

  // Generate instant local data first so user sees chart in 0.01 seconds
  if (currentTimeframe === 'yearly') {
    data = generateYearlyData(resolvedTicker, basePrice, isCrypto);
  } else if (currentTimeframe === 'minute' || currentTimeframe === 'tick') {
    data = generateIntradayData(resolvedTicker, basePrice, currentTimeframe, isCrypto);
  } else {
    data = generateSimulatedDaily(resolvedTicker, basePrice, isCrypto);
  }

  // Immediately render instant chart for 0ms delay experience
  currentData = data;
  if (chart) {
    chart.setData(data);
  }
  updateStats(data);
  updateRightSections(meta, data);
  updateScore(data);

  // 3. Fetch real Yahoo Finance Data asynchronously in background via single fast Express API
  const API_BASE = window.JISP_API_BASE || '';
  const apiUrl = `${API_BASE}/api/chart?ticker=${encodeURIComponent(resolvedTicker)}&timeframe=${currentTimeframe}`;

  fetch(apiUrl)
    .then(res => {
      if (!res.ok) throw new Error('API Error');
      return res.json();
    })
    .then(resData => {
      let realCandles = [];
      if (Array.isArray(resData)) {
        realCandles = resData;
      } else if (resData.chart) {
        realCandles = parseYahooFinanceData(resData, currentTimeframe);
      }

      if (realCandles && realCandles.length > 0) {
        currentData = realCandles;
        if (chart) {
          chart.setData(realCandles);
        }
        updateStats(realCandles);
        updateRightSections(meta, realCandles);
        updateScore(realCandles);
        addLog(`REALTIME MARKET DATA SYNCHRONIZED FOR [${resolvedTicker}].`, 'success');
      }
    })
    .catch(err => {
      addLog(`FAST HYBRID FEED ACTIVE FOR [${resolvedTicker}].`, 'info');
    });

  if (chart) {
    chart.isLoading = false;
  }
  currentData = data;
  runTechnicalAnalysis();

  // 3. Current Price and Change calculation
  if (data.length > 0) {
    const currentPrice = data[data.length - 1].close;
    const prevClose = data[data.length - 2] ? data[data.length - 2].close : currentPrice;
    const change = currentPrice - prevClose;
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
    
    // Formatting currency symbols
    if (isKR) {
      DOM.infoCurrentPrice.textContent = `₩${Math.round(currentPrice).toLocaleString()}`;
      DOM.infoPriceChange.textContent = `${change >= 0 ? '+' : ''}${Math.round(change).toLocaleString()} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
    } else {
      DOM.infoCurrentPrice.textContent = `$${currentPrice.toFixed(2)}`;
      DOM.infoPriceChange.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
    }
    
    // Style text color (Green for rise, Pink for drop)
    if (change >= 0) {
      DOM.infoPriceChange.style.color = '#10b981'; // Green
    } else {
      DOM.infoPriceChange.style.color = '#ef4444'; // Red
    }
  }

  // 4. Update Financials (using preloaded or deterministic mock)
  let fin = FINANCIALS[resolvedTicker];
  if (!fin) {
    let h = 0;
    for (let i = 0; i < resolvedTicker.length; i++) {
      h = Math.imul(31, h) + resolvedTicker.charCodeAt(i) | 0;
    }
    const theme = {
    bg: '#ffffff',
    grid: '#f3f4f6',
    text: '#6b7280',
    up: '#10b981',
    down: '#ef4444',
    wickUp: '#10b981',
    wickDown: '#ef4444',
    volUp: 'rgba(16, 185, 129, 0.2)',
    volDown: 'rgba(239, 68, 68, 0.2)',
    crosshair: 'rgba(0,0,0,0.1)',
    crosshairBg: '#1f2937'
  };

    const random = () => {
      h = Math.sin(h) * 10000;
      return h - Math.floor(h);
    };

    if (isCrypto) {
      fin = {
        name: name,
        per: 'N/A',
        pbr: 'N/A',
        roe: 'N/A',
        eps: 'N/A',
        revenue: 'N/A',
        income: 'N/A'
      };
    } else {
      fin = {
        name: name,
        per: (10 + random() * 50).toFixed(1) + 'x',
        pbr: (1.0 + random() * 15).toFixed(1) + 'x',
        roe: (5 + random() * 35).toFixed(1) + '%',
        eps: isKR ? '₩' + Math.round(500 + random() * 10000).toLocaleString() : '$' + (0.1 + random() * 12).toFixed(2),
        revenue: isKR ? '₩' + (1 + random() * 50).toFixed(1) + 'T' : '$' + (1 + random() * 200).toFixed(1) + 'B',
        income: isKR ? '₩' + (0.05 + random() * 10).toFixed(1) + 'T' : '$' + (0.05 + random() * 40).toFixed(1) + 'B'
      };
    }
  }

  // Update Financial Info display panel
  DOM.companyName.textContent = fin.name;
  DOM.infoTicker.textContent = resolvedTicker;
  DOM.finPer.textContent = fin.per;
  DOM.finPbr.textContent = fin.pbr;
  DOM.finRoe.textContent = fin.roe;
  DOM.finEps.textContent = fin.eps;
  DOM.finRev.textContent = fin.revenue;
  DOM.finInc.textContent = fin.income;

  // ─── Update Short Selling & Company Profile Data ───
  let hashVal = 0;
  for (let i = 0; i < resolvedTicker.length; i++) {
    hashVal = Math.imul(31, hashVal) + resolvedTicker.charCodeAt(i) | 0;
  }
  const prng = () => {
    hashVal = Math.sin(hashVal) * 10000;
    return hashVal - Math.floor(hashVal);
  };

  const isCryptoAsset = isCrypto || resolvedTicker === 'BTC';

  // Short Selling mock data
  const squeezeProb = isCryptoAsset ? 0 : Math.round(5 + prng() * 90);
  const borrowRate = isCryptoAsset ? 0 : +(0.5 + prng() * 35).toFixed(2);
  const daysCover = isCryptoAsset ? 0 : +(0.2 + prng() * 12).toFixed(1);
  const floatPct = isCryptoAsset ? 0 : +(0.5 + prng() * 45).toFixed(2);
  const shortVol = isCryptoAsset ? 0 : +(0.1 + prng() * 100).toFixed(2);

  // Squeeze risk assessment
  let riskLabel = 'LOW';
  let riskColor = '#10b981';
  let riskBg = 'rgba(16, 185, 129, 0.15)';
  if (squeezeProb >= 70) {
    riskLabel = 'HIGH RISK';
    riskColor = '#ef4444';
    riskBg = 'rgba(239, 68, 68, 0.15)';
  } else if (squeezeProb >= 40) {
    riskLabel = 'MODERATE';
    riskColor = '#fbbf24';
    riskBg = 'rgba(250, 189, 36, 0.15)';
  }

  // Update Shorts HUD elements
  if (isCryptoAsset) {
    DOM.shortsSqueezeProb.textContent = 'N/A';
    DOM.shortsSqueezeAlert.textContent = 'NO SHORT DATA';
    DOM.shortsSqueezeAlert.style.color = '#94a3b8';
    DOM.shortsSqueezeAlert.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
    DOM.shortsInterestVol.textContent = 'N/A';
    DOM.shortsBorrowRate.textContent = 'N/A';
    DOM.shortsDaysCover.textContent = 'N/A';
    DOM.shortsFloatPct.textContent = 'N/A';
    DOM.shortsSentimentDesc.textContent = 'Cryptocurrency derivative markets do not publish traditional short-interest and borrow data on standard exchanges.';
  } else {
    DOM.shortsSqueezeProb.textContent = `${squeezeProb}%`;
    DOM.shortsSqueezeAlert.textContent = riskLabel;
    DOM.shortsSqueezeAlert.style.color = riskColor;
    DOM.shortsSqueezeAlert.style.backgroundColor = riskBg;
    DOM.shortsInterestVol.textContent = `${shortVol}M shares`;
    DOM.shortsBorrowRate.textContent = `${borrowRate}%`;
    DOM.shortsDaysCover.textContent = `${daysCover} Days`;
    DOM.shortsFloatPct.textContent = `${floatPct}%`;
    DOM.shortsSentimentDesc.textContent = squeezeProb >= 70 
      ? 'Short sellers are extremely overextended. Massive squeeze potential detected under bullish volume.'
      : squeezeProb >= 40 
        ? 'Steady short seller presence. Moderate pressure. Squeeze potential is dependent on market catalysts.'
        : 'Low short interest relative to average trading volume. Squeeze probability is negligible.';
  }

  // Company Profile details
  let ceo = 'Jiseob Won';
  let industry = 'Technology Services';
  let founded = 2026;
  let employees = '2';
  let desc = 'Designs, develops, and delivers next-generation financial analytics dashboards.';

  const profileDb = {
    NVDA: { ceo: 'Jensen Huang', industry: 'Semiconductors', founded: 1993, employees: '29,600', desc: 'Designs graphics processing units (GPUs) for the gaming and professional markets, as well as system on a chip units.' },
    TSLA: { ceo: 'Elon Musk', industry: 'Electric Vehicles', founded: 2003, employees: '140,400', desc: 'Designs, manufactures, and sells electric vehicles, energy generation, and battery storage systems globally.' },
    AAPL: { ceo: 'Tim Cook', industry: 'Consumer Electronics', founded: 1976, employees: '161,000', desc: 'Designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.' },
    MSFT: { ceo: 'Satya Nadella', industry: 'Software & Cloud Services', founded: 1975, employees: '221,000', desc: 'Develops, licenses, and supports software, services, devices, and personal computing solutions.' },
    GOOGL: { ceo: 'Sundar Pichai', industry: 'Internet & AI Services', founded: 1998, employees: '182,000', desc: 'Provides search engine technology, online advertising, cloud computing, computer software, and quantum computing.' },
    AMZN: { ceo: 'Andy Jassy', industry: 'E-commerce & Cloud', founded: 1994, employees: '1,541,000', desc: 'Focuses on e-commerce, cloud computing, digital streaming, artificial intelligence, and online retail.' },
    BTC: { ceo: 'Satoshi Nakamoto', industry: 'Cryptocurrency Protocol', founded: 2009, employees: 'Decentralized', desc: 'Decentralized digital currency, without a central bank or single administrator, sent user-to-user on a peer-to-peer network.' }
  };

  const activeProfile = profileDb[resolvedTicker] || {
    ceo: prng() > 0.5 ? 'David Miller' : 'Jihoo Jung',
    industry: isKR ? 'K-Market Conglomerate' : 'US Mid-Cap Services',
    founded: Math.round(1980 + prng() * 40),
    employees: Math.round(1000 + prng() * 50000).toLocaleString(),
    desc: `A prominent player listed under the ${sector} sector, known for expanding its core offerings in international markets.`
  };

  DOM.compCeo.textContent = activeProfile.ceo;
  DOM.compIndustry.textContent = activeProfile.industry;
  DOM.compEmployees.textContent = activeProfile.employees;
  DOM.compFounded.textContent = activeProfile.founded;
  DOM.compDesc.textContent = activeProfile.desc;

  // 3-Year Financial Statements
  let revBase = 100.0;
  let incBase = 15.0;
  let isTrillionSymbol = false;
  
  if (fin && fin.revenue && fin.revenue !== 'N/A') {
    isTrillionSymbol = fin.revenue.includes('T');
    const matchedVal = fin.revenue.replace(/[^0-9.]/g, '');
    revBase = parseFloat(matchedVal) || 100.0;
  }
  if (fin && fin.income && fin.income !== 'N/A') {
    const matchedVal = fin.income.replace(/[^0-9.]/g, '');
    incBase = parseFloat(matchedVal) || 15.0;
  }

  const formatUnit = (val) => {
    if (isCryptoAsset) return 'N/A';
    const symbol = isKR ? '₩' : '$';
    const suffix = isKR ? (isTrillionSymbol ? 'T' : 'B') : 'B';
    return `${symbol}${val.toFixed(1)}${suffix}`;
  };

  // Generate 3 years financials based on 2025 base value
  const r25 = revBase;
  const r24 = revBase * (0.75 + prng() * 0.15);
  const r23 = r24 * (0.8 + prng() * 0.15);

  const i25 = incBase;
  const i24 = incBase * (0.7 + prng() * 0.2);
  const i23 = i24 * (0.75 + prng() * 0.15);

  const a25 = revBase * (1.1 + prng() * 0.5);
  const a24 = a25 * (0.85 + prng() * 0.1);
  const a23 = a24 * (0.85 + prng() * 0.1);

  const l25 = a25 * (0.3 + prng() * 0.3);
  const l24 = a24 * (0.3 + prng() * 0.3);
  const l23 = a23 * (0.3 + prng() * 0.3);

  const c25 = i25 * (0.9 + prng() * 0.3);
  const c24 = i24 * (0.9 + prng() * 0.3);
  const c23 = i23 * (0.9 + prng() * 0.3);

  DOM.tableRev23.textContent = formatUnit(r23);
  DOM.tableRev24.textContent = formatUnit(r24);
  DOM.tableRev25.textContent = formatUnit(r25);

  DOM.tableInc23.textContent = formatUnit(i23);
  DOM.tableInc24.textContent = formatUnit(i24);
  DOM.tableInc25.textContent = formatUnit(i25);

  DOM.tableAss23.textContent = formatUnit(a23);
  DOM.tableAss24.textContent = formatUnit(a24);
  DOM.tableAss25.textContent = formatUnit(a25);

  DOM.tableLia23.textContent = formatUnit(l23);
  DOM.tableLia24.textContent = formatUnit(l24);
  DOM.tableLia25.textContent = formatUnit(l25);

  DOM.tableCf23.textContent = formatUnit(c23);
  DOM.tableCf24.textContent = formatUnit(c24);
  DOM.tableCf25.textContent = formatUnit(c25);

  addLog(`ASSET CORE [${resolvedTicker}] LOADED SUCCESSFULLY. ${data.length} TICKS PARSED.`, 'success');
}

function runTechnicalAnalysis() {
  if (currentData.length === 0) return;

  // Calculate Support & Resistance
  const sr = findSupportResistance(currentData);
  
  // Calculate Technical Score
  const analysis = analyzeTechnicalScore(currentData);

  // Generate Future Prediction Corridor
  currentForecast = predictFutureCorridor(currentData, 20);

  // Render variables in TechnicalChart options
  chart.options.sr = sr;
  chart.setData(currentData, currentForecast);

  // Update HUD values
  updateAIDashboard(analysis, sr);
}

/* ── CSV Drag and Drop Parser ────────────── */
function parseCSV(file) {
  addLog(`UPLOAD SIGNAL DETECTED. READING CUSTOM STREAM: [${file.name}]...`);
  
  const reader = new FileReader();
  reader.readAsText(file);

  reader.onload = (e) => {
    try {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length < 2) {
        throw new Error('File contains no tabular headers or data columns.');
      }

      // Detect separator (comma or semicolon)
      const headerLine = lines[0];
      const sep = headerLine.includes(';') ? ';' : ',';
      const headers = headerLine.split(sep).map(h => h.trim().toLowerCase());

      // Identify column indices
      const idx = {
        date: headers.findIndex(h => h.includes('date') || h.includes('time') || h === 'dt'),
        open: headers.findIndex(h => h.includes('open') || h === 'o'),
        high: headers.findIndex(h => h.includes('high') || h === 'h'),
        low: headers.findIndex(h => h.includes('low') || h === 'l'),
        close: headers.findIndex(h => h.includes('close') || h === 'c'),
        volume: headers.findIndex(h => h.includes('volume') || h.includes('vol') || h === 'v')
      };

      // Valid headers check
      if (idx.date === -1 || idx.open === -1 || idx.high === -1 || idx.low === -1 || idx.close === -1) {
        throw new Error('Missing columns. CSV must contain Date, Open, High, Low, Close.');
      }

      const parsedData = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(sep).map(c => c.trim());
        if (cols.length < headers.length) continue; // skip broken rows

        const item = {
          date: cols[idx.date],
          open: parseFloat(cols[idx.open]),
          high: parseFloat(cols[idx.high]),
          low: parseFloat(cols[idx.low]),
          close: parseFloat(cols[idx.close]),
          volume: idx.volume !== -1 ? parseInt(cols[idx.volume], 10) || 0 : 0
        };

        if (isNaN(item.open) || isNaN(item.high) || isNaN(item.low) || isNaN(item.close)) {
          continue; // skip rows with invalid pricing numbers
        }

        parsedData.push(item);
      }

      if (parsedData.length < 15) {
        throw new Error('Not enough candles. Minimum required data points is 15.');
      }

      // Sort chronological ascending (oldest first)
      parsedData.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Load data to workspace
      currentTicker = file.name.substring(0, 10).toUpperCase();
      
      // Update UI selection active state to denote custom data
      document.querySelectorAll('.asset-item').forEach(el => el.classList.remove('active'));
      
      currentData = parsedData;
      runTechnicalAnalysis();

      // Update Financial Info with simulated data for custom file
      const mockFin = generateSimulatedData(currentTicker).fin;
      DOM.companyName.textContent = file.name.split('.')[0] + ' (CSV)';
      DOM.infoTicker.textContent = currentTicker;
      DOM.finPer.textContent = mockFin.per;
      DOM.finPbr.textContent = mockFin.pbr;
      DOM.finRoe.textContent = mockFin.roe;
      DOM.finEps.textContent = mockFin.eps;
      DOM.finRev.textContent = mockFin.revenue;
      DOM.finInc.textContent = mockFin.income;

      addLog(`PARSING STREAM COMPLETE. LOADED ${parsedData.length} ROWS OF CUSTOM DATA [${currentTicker}].`, 'success');

    } catch (err) {
      addLog(`PARSING ERROR: ${err.message}`, 'error');
      alert(`🚨 CSV Parse Error:\n${err.message}`);
    }
  };

  reader.onerror = () => {
    addLog(`FILE READER EMITTED SEVERE STREAM ERROR.`, 'error');
  };
}

/* ── HUD UI Renderers ────────────────────── */
function updateAIDashboard(analysis, sr) {
  // Score label counter animation
  const startVal = parseInt(DOM.gaugeVal.textContent, 10) || 50;
  animateValue(DOM.gaugeVal, startVal, analysis.score, 800);

  // Score glow angle rotaion
  DOM.gaugeGlow.style.transform = `rotate(${analysis.score * 3.6}deg)`;

  // Recommendations status badge updates
  DOM.badge.className = 'score-badge ' + analysis.trend;
  DOM.badge.textContent = analysis.status;

  // Support & Resistance lists updates
  DOM.resLevels.innerHTML = sr.resistances.length > 0 
    ? sr.resistances.map(val => `<div class="level-val">${val.toFixed(2)}</div>`).join('')
    : '---';

  DOM.supLevels.innerHTML = sr.supports.length > 0 
    ? sr.supports.map(val => `<div class="level-val">${val.toFixed(2)}</div>`).join('')
    : '---';

  // Analytical factors list update
  DOM.factorList.innerHTML = '';
  analysis.factors.forEach(f => {
    const isPlus = f.score.startsWith('+');
    const isMinus = f.score.startsWith('-');
    const scoreClass = isPlus ? 'plus' : (isMinus ? 'minus' : 'zero');

    const item = document.createElement('div');
    item.className = 'factor-item';
    item.innerHTML = `
      <div>
        <div class="factor-name">${f.name}</div>
        <div class="factor-desc">${f.desc}</div>
      </div>
      <div class="factor-score ${scoreClass}">${f.score}</div>
    `;
    DOM.factorList.appendChild(item);
  });
}

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end;
    }
  };
  window.requestAnimationFrame(step);
}

function addLog(msg, type = 'info') {
  const row = document.createElement('div');
  row.className = `terminal-row ${type}`;
  
  const time = new Date().toLocaleTimeString();
  row.innerHTML = `<span class="time">[${time}]</span><span class="msg">${msg}</span>`;
  
  DOM.terminal.appendChild(row);
  DOM.terminal.scrollTop = DOM.terminal.scrollHeight;

  // Keep logs list trimmed
  if (DOM.terminal.children.length > 50) {
    DOM.terminal.removeChild(DOM.terminal.firstChild);
  }
}
