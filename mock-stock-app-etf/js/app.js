// ─── Main Controller & SPA Routing ───────────────────────────────
import { Store } from './store.js';
import { MarketEngine } from './engine.js';
import { getAllAssets, getAssetByTicker, getETFSectors } from './data.js?v=2';
import { Chart } from './charts.js';
import { 
  renderCharacter, 
  SHOP_ITEMS, 
  CATEGORIES, 
  SKIN_COLORS, 
  HAIR_COLORS, 
  EYE_COLORS, 
  HAIR_STYLES,
  getItemsByCategory,
  getItemById,
  RARITY_COLORS
} from './character.js';

// Global instances
let engine = null;
let currentChart = null;
let activeTab = 'home';
let selectedAsset = null;
let tradingMode = 'buy'; // 'buy' or 'sell'
let currentDecoSubTab = 'hairStyle';
let currentShopCategory = 'hat';
let portfolioSubTab = 'holdings'; // 'holdings' or 'history'

function formatPrice(val) {
  if (val === undefined || val === null) return '$0.00';
  if (val <= 0) return '$0.00';
  if (val < 0.001) return '$' + val.toFixed(8);
  if (val < 0.1) return '$' + val.toFixed(5);
  if (val < 1.0) return '$' + val.toFixed(4);
  return '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// DOM elements cached
const DOM = {
  main: document.getElementById('app-main'),
  navItems: document.querySelectorAll('.nav-item'),
  toastContainer: document.getElementById('toast-container'),
  
  // Views
  views: {
    home: document.getElementById('view-home'),
    market: document.getElementById('view-market'),
    portfolio: document.getElementById('view-portfolio'),
    decorate: document.getElementById('view-decorate'),
    shop: document.getElementById('view-shop'),
    ranking: document.getElementById('view-ranking'),
  },

  // Home View
  homeTotalAssets: document.getElementById('home-total-assets'),
  homeCash: document.getElementById('home-cash'),
  homeUnrealizedPnL: document.getElementById('home-unrealized-pnl'),
  homeCharacterPreview: document.getElementById('home-character-preview'),
  homeRealizedProfit: document.getElementById('home-realized-profit'),
  homeShoppingCash: document.getElementById('home-shopping-cash'),
  homeTopGainers: document.getElementById('home-top-gainers'),
  homeTopLosers: document.getElementById('home-top-losers'),
  btnResetData: document.getElementById('btn-reset-data'),

  // Market View
  marketTabAll: document.getElementById('market-tab-all'),
  marketTabStocks: document.getElementById('market-tab-index'),
  marketTabCrypto: document.getElementById('market-tab-sector'),
  marketTabWatchlist: document.getElementById('market-tab-watchlist'),
  marketSearch: document.getElementById('market-search'),
  sectorFilters: document.getElementById('sector-filters'),
  marketList: document.getElementById('market-list'),

  // Portfolio View
  portTotalAssets: document.getElementById('port-total-assets'),
  portUnrealizedPnL: document.getElementById('port-unrealized-pnl'),
  portCash: document.getElementById('port-cash'),
  portRealizedProfit: document.getElementById('port-realized-profit'),
  portTabHoldings: document.getElementById('port-tab-holdings'),
  portTabHistory: document.getElementById('port-tab-history'),
  portHoldingsContainer: document.getElementById('port-holdings-container'),
  portHoldingsList: document.getElementById('port-holdings-list'),
  portHistoryContainer: document.getElementById('port-history-container'),
  portHistoryList: document.getElementById('port-history-list'),

  // Decorate View
  characterCardMain: document.getElementById('character-card-main'),
  decoShoppingCash: document.getElementById('deco-shopping-cash'),
  customOptionsGrid: document.getElementById('custom-options-grid'),

  // Shop View
  shopShoppingCash: document.getElementById('shop-shopping-cash'),
  shopCategoriesContainer: document.getElementById('shop-categories-container'),
  shopItemsGrid: document.getElementById('shop-items-grid'),

  // Detail Sheet & Trading
  detailOverlay: document.getElementById('detail-overlay'),
  detailTicker: document.getElementById('detail-ticker'),
  detailSectorBadge: document.getElementById('detail-sector-badge'),
  detailWatchlistBtn: document.getElementById('detail-watchlist-btn'),
  detailName: document.getElementById('detail-name'),
  detailCloseBtn: document.getElementById('detail-close-btn'),
  detailPrice: document.getElementById('detail-price'),
  detailChange: document.getElementById('detail-change'),
  detailVolume: document.getElementById('detail-volume'),
  detailMarketCap: document.getElementById('detail-marketcap'),
  stockChartCanvas: document.getElementById('stock-chart-canvas'),
  tradeTabBuy: document.getElementById('trade-tab-buy'),
  tradeTabSell: document.getElementById('trade-tab-sell'),
  tradeQty: document.getElementById('trade-qty'),
  tradeBtnMax: document.getElementById('trade-btn-max'),
  tradeAvailableCash: document.getElementById('trade-available-cash'),
  tradeOwnedShares: document.getElementById('trade-owned-shares'),
  tradeEstimatedTotal: document.getElementById('trade-estimated-total'),
  tradeSubmitBtn: document.getElementById('trade-submit-btn'),

  // Polar Payment Overlay Elements
  jispOverlay: document.getElementById('jisp-payment-overlay'),
  jispClose: document.getElementById('jisp-payment-close'),
  jispSubmit: document.getElementById('jisp-pay-submit-btn'),
  jispAdBanner: document.getElementById('jisp-ad-banner'),
  jispAdUpgradeBtn: document.getElementById('jisp-ad-upgrade-btn'),
  jispPremiumBtn: document.getElementById('jisp-premium-btn'),

  // Ranking View Elements
  userCurrentRank: document.getElementById('user-current-rank'),
  userRankingAssets: document.getElementById('user-ranking-assets'),
  rankingList: document.getElementById('ranking-list'),

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

/* ── SPA Navigation ─────────────────────── */
window.switchTab = function(tabName) {
  activeTab = tabName;
  
  // Update nav item active classes
  DOM.navItems.forEach(item => {
    const text = item.querySelector('span:last-child').textContent.toLowerCase();
    if (text === tabName || (tabName === 'decorate' && text === 'avatar')) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Toggle visible views
  Object.keys(DOM.views).forEach(key => {
    if (key === tabName) {
      DOM.views[key].classList.add('active');
    } else {
      DOM.views[key].classList.remove('active');
    }
  });

  // Trigger render corresponding to the tab
  renderActiveTab();
};

function renderActiveTab() {
  if (activeTab === 'home') renderHome();
  else if (activeTab === 'market') renderMarket();
  else if (activeTab === 'portfolio') renderPortfolio();
  else if (activeTab === 'decorate') renderDecorate();
  else if (activeTab === 'shop') renderShop();
  else if (activeTab === 'ranking') renderRanking();
}

/* ── Toast Notifications ────────────────── */
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  DOM.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.25s forwards';
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

// Add CSS fadeOut animation to DOM header injection
const styleSheet = document.createElement('style');
styleSheet.innerText = `@keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-10px); } }`;
document.head.appendChild(styleSheet);

/* ── App Initialization ─────────────────── */
function init() {
  // 1. Init store
  Store.init();

  // 2. Init engine
  const assets = getAllAssets();
  engine = new MarketEngine(assets);
  engine.start(2000);

  // 3. Setup core event listeners
  setupListeners();

  // 4. Toss Payment modal event handlers
  function syncPremium() {
    const isPremium = localStorage.getItem('jisp_premium') === 'true';
    if (isPremium) {
      if (DOM.jispAdBanner) DOM.jispAdBanner.classList.add('premium-hide');
      if (DOM.jispPremiumBtn) {
        DOM.jispPremiumBtn.textContent = '👑 JISP Pro 회원';
        DOM.jispPremiumBtn.style.background = 'var(--color-gold)';
        DOM.jispPremiumBtn.style.color = '#1e1b4b';
      }
    } else {
      if (DOM.jispAdBanner) DOM.jispAdBanner.classList.remove('premium-hide');
      if (DOM.jispPremiumBtn) {
        DOM.jispPremiumBtn.textContent = 'JISP Pro 가입';
        DOM.jispPremiumBtn.style.background = '#f59e0b';
        DOM.jispPremiumBtn.style.color = '#1e1b4b';
      }
    }
  }

  // SSO Auth Logic
  let authMode = 'login';
  let lastLoadedUsername = null;
  function syncAuth() {
    const userRaw = localStorage.getItem('jisp_user');
    let currentUsername = '';
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        currentUsername = user.username || '';
        DOM.authBtn.innerHTML = `👤 ${user.username} <button id="portal-logout-btn" style="background:#ef4444; border:none; color:#fff; border-radius:10px; padding:2px 8px; font-size:10px; cursor:pointer; margin-left:4px; font-weight:700;">OUT</button>`;
        DOM.authBtn.style.background = 'var(--bg-card)';
        DOM.authBtn.style.color = '#fff';
        
        const logoutBtn = document.getElementById('portal-logout-btn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            localStorage.removeItem('jisp_user');
            showToast('로그아웃 되었습니다.');
            syncAuth();
            if (activeTab === 'ranking') renderRanking();
          });
        }
      } catch (e) {
        localStorage.removeItem('jisp_user');
      }
    } else {
      DOM.authBtn.innerHTML = '로그인';
      DOM.authBtn.style.background = '#2563eb';
      DOM.authBtn.style.color = '#fff';
    }

    if (currentUsername !== lastLoadedUsername) {
      lastLoadedUsername = currentUsername;
      Store.init();
      if (engine && engine.prices) {
        updatePortfolioSumInHome();
        renderPortfolio();
      }
      renderDecorate();
      renderShop();
      if (activeTab === 'ranking') renderRanking();
    }
  }

  if (DOM.authBtn) {
    DOM.authBtn.addEventListener('click', () => {
      const userRaw = localStorage.getItem('jisp_user');
      if (!userRaw) {
        DOM.authOverlay.classList.add('active');
      }
    });
  }

  if (DOM.authClose) {
    DOM.authClose.addEventListener('click', () => {
      DOM.authOverlay.classList.remove('active');
    });
  }

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

  if (DOM.authSwitchAction) {
    DOM.authSwitchAction.addEventListener('click', handleAuthSwitch);
  }

  if (DOM.authSubmit) {
    DOM.authSubmit.addEventListener('click', () => {
      const email = DOM.authEmailInput.value.trim();
      const pw = DOM.authPasswordInput.value.trim();
      if (!email || !pw) {
        showToast('이메일과 비밀번호를 입력해주세요.');
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
            showToast('이미 가입된 이메일 주소입니다.');
            DOM.authSubmit.disabled = false;
            DOM.authSubmit.textContent = '가입하기';
            return;
          }
          const newUser = { username, email, password: pw };
          registeredUsers.push(newUser);
          localStorage.setItem('jisp_registered_users', JSON.stringify(registeredUsers));

          const user = { username, email, loggedIn: true };
          localStorage.setItem('jisp_user', JSON.stringify(user));
          showToast(`🎉 회원가입 완료: ${username}`);
        } else {
          const found = registeredUsers.find(u => u.email === email && u.password === pw);
          if (!found) {
            showToast('가입되지 않은 계정이거나 비밀번호가 일치하지 않습니다.');
            DOM.authSubmit.disabled = false;
            DOM.authSubmit.textContent = '로그인';
            return;
          }
          const user = { username: found.username, email, loggedIn: true };
          localStorage.setItem('jisp_user', JSON.stringify(user));
          showToast(`👋 어서오세요, ${found.username}님!`);
        }
        DOM.authOverlay.classList.remove('active');
        DOM.authSubmit.disabled = false;
        DOM.authSubmit.textContent = authMode === 'login' ? '로그인' : '가입하기';
        syncAuth();
        if (activeTab === 'ranking') renderRanking();
      }, 1200);
    });
  }

  setInterval(syncAuth, 1000);
  syncAuth();

  window.openCheckout = function() {
    if (DOM.jispOverlay) DOM.jispOverlay.classList.add('active');
  }

  if (DOM.jispAdUpgradeBtn) {
    DOM.jispAdUpgradeBtn.addEventListener('click', window.openCheckout);
  }
  if (DOM.jispClose && DOM.jispOverlay) {
    DOM.jispClose.addEventListener('click', () => DOM.jispOverlay.classList.remove('active'));
  }

  if (DOM.jispPremiumBtn) {
    DOM.jispPremiumBtn.addEventListener('click', () => {
      const isPremium = localStorage.getItem('jisp_premium') === 'true';
      if (isPremium) {
        if (confirm('JISP Pro 구독을 취소하시겠습니까? (테스트용)')) {
          localStorage.setItem('jisp_premium', 'false');
          syncPremium();
          showToast('구독이 취소되었습니다. (체험용)');
        }
      } else {
        window.openCheckout();
      }
    });
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
        showToast('입금자명과 이메일 주소를 입력해주세요.');
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
        showToast('서버 통신 실패. 백엔드가 실행 중인지 확인하세요.');
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

  // 5. Initial rendering
  switchTab('home');

  // 6. Connect engine price update listener
  engine.onPriceUpdate((prices) => {
    updatePricesInUI(prices);
  });
}

function setupListeners() {
  // Reset game button
  DOM.btnResetData.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all game data? This resets your seed to $1,000, portfolio, and items.')) {
      Store.reset();
      showToast('Game has been reset! Starting seed is $1,000.');
      renderActiveTab();
    }
  });

  // Watchlist & Category Tabs in Market
  let marketFilter = 'all'; // 'all', 'stocks', 'crypto', 'watchlist'
  let selectedSector = null;

  const setMarketFilter = (filter) => {
    marketFilter = filter;
    DOM.marketTabAll.classList.toggle('active', filter === 'all');
    DOM.marketTabStocks.classList.toggle('active', filter === 'index');
    DOM.marketTabCrypto.classList.toggle('active', filter === 'sector');
    DOM.marketTabWatchlist.classList.toggle('active', filter === 'watchlist');
    currentMarketTab = filter;
    currentSectorFilter = null;
    renderMarket();
  };

  DOM.marketTabAll.addEventListener('click', () => setMarketFilter('all'));
  DOM.marketTabStocks.addEventListener('click', () => setMarketFilter('index'));
  DOM.marketTabCrypto.addEventListener('click', () => setMarketFilter('sector'));
  DOM.marketTabWatchlist.addEventListener('click', () => setMarketFilter('watchlist'));

  // Search filter
  DOM.marketSearch.addEventListener('input', () => {
    renderMarket();
  });

  // Detail sheets close trigger
  DOM.detailCloseBtn.addEventListener('click', closeDetailOverlay);
  DOM.detailOverlay.addEventListener('click', (e) => {
    if (e.target === DOM.detailOverlay) closeDetailOverlay();
  });

  // Watchlist toggle button in detail
  DOM.detailWatchlistBtn.addEventListener('click', () => {
    if (!selectedAsset) return;
    Store.toggleWatchlist(selectedAsset.ticker);
    updateWatchlistBtn();
    renderMarket();
  });

  // Buy/Sell tab switcher inside trade sheet
  DOM.tradeTabBuy.addEventListener('click', () => setTradingMode('buy'));
  DOM.tradeTabSell.addEventListener('click', () => setTradingMode('sell'));

  // Trading Input logic
  DOM.tradeQty.addEventListener('input', updateEstimatedTotal);
  DOM.tradeBtnMax.addEventListener('click', () => {
    if (!selectedAsset) return;
    const currentPrice = engine.getPrice(selectedAsset.ticker).price;
    if (tradingMode === 'buy') {
      const maxShares = Math.floor(Store.state.cash / (currentPrice * 1.00015)); // including comm
      DOM.tradeQty.value = maxShares;
    } else {
      const holding = Store.getHolding(selectedAsset.ticker);
      DOM.tradeQty.value = holding ? holding.shares : 0;
    }
    updateEstimatedTotal();
  });

  // Submit trade order
  DOM.tradeSubmitBtn.addEventListener('click', () => {
    if (!selectedAsset) return;
    const qty = parseInt(DOM.tradeQty.value);
    const currentPrice = engine.getPrice(selectedAsset.ticker).price;

    if (isNaN(qty) || qty <= 0) {
      showToast('Please enter a valid quantity.');
      return;
    }

    if (tradingMode === 'buy') {
      const res = Store.buy(selectedAsset.ticker, selectedAsset.name, qty, currentPrice);
      if (res.ok) {
        showToast(`Successfully bought ${qty} ${selectedAsset.ticker}!`);
        closeDetailOverlay();
        renderActiveTab();
      } else {
        showToast(`Buy order failed: ${res.msg}`);
      }
    } else {
      const res = Store.sell(selectedAsset.ticker, selectedAsset.name, qty, currentPrice);
      if (res.ok) {
        const profitMsg = res.profit >= 0 
          ? `profit of +$${res.profit.toFixed(2)}` 
          : `loss of -$${Math.abs(res.profit).toFixed(2)}`;
        showToast(`Successfully sold ${qty} ${selectedAsset.ticker} (${profitMsg})!`);
        closeDetailOverlay();
        renderActiveTab();
      } else {
        showToast(`Sell order failed: ${res.msg}`);
      }
    }
  });

  // Portfolio Sub Tabs
  DOM.portTabHoldings.addEventListener('click', () => {
    portfolioSubTab = 'holdings';
    DOM.portTabHoldings.classList.add('active');
    DOM.portTabHistory.classList.remove('active');
    DOM.portHoldingsContainer.style.display = 'block';
    DOM.portHistoryContainer.style.display = 'none';
    renderPortfolio();
  });

  DOM.portTabHistory.addEventListener('click', () => {
    portfolioSubTab = 'history';
    DOM.portTabHoldings.classList.remove('active');
    DOM.portTabHistory.classList.add('active');
    DOM.portHoldingsContainer.style.display = 'none';
    DOM.portHistoryContainer.style.display = 'block';
    renderPortfolio();
  });

  // Decorate view sub tabs
  DOM.main.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.custom-tab-btn');
    if (tabBtn) {
      const parent = tabBtn.parentElement;
      parent.querySelectorAll('.custom-tab-btn').forEach(btn => btn.classList.remove('active'));
      tabBtn.classList.add('active');
      currentDecoSubTab = tabBtn.dataset.tab;
      renderDecoSubTabOptions();
    }
  });

  // Expose helper to toggle items category
  window.setShopCategory = function(catId) {
    currentShopCategory = catId;
    renderShop();
  };

  // Expose global actions
  window.openAssetDetail = function(ticker) {
    openDetailOverlay(ticker);
  };
}

/* ── Close/Open Trading Detail Overlay ──── */
function openDetailOverlay(ticker) {
  const asset = getAssetByTicker(ticker);
  if (!asset) return;
  selectedAsset = asset;
  tradingMode = 'buy';

  DOM.detailTicker.textContent = asset.ticker;
  DOM.detailName.textContent = asset.name;
  DOM.detailSectorBadge.textContent = asset.sector;
  DOM.detailSectorBadge.className = `badge badge-${asset.sector === 'Crypto' ? 'epic' : 'rare'}`;

  updateWatchlistBtn();
  updateDetailedPriceInfo();
  setTradingMode('buy');

  DOM.detailOverlay.classList.add('active');

  // Initialize Canvas Chart
  if (currentChart) {
    currentChart.destroy();
  }
  const canvas = DOM.stockChartCanvas;
  // Get intraday history from engine
  const chartData = engine.getIntradayHistory(ticker);
  currentChart = new Chart(canvas);
  currentChart.setData(chartData);
}

function closeDetailOverlay() {
  DOM.detailOverlay.classList.remove('active');
  selectedAsset = null;
  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }
}

function updateWatchlistBtn() {
  if (!selectedAsset) return;
  const isWatched = Store.state.watchlist.includes(selectedAsset.ticker);
  DOM.detailWatchlistBtn.textContent = isWatched ? '★' : '☆';
  DOM.detailWatchlistBtn.style.color = isWatched ? 'var(--color-gold)' : 'var(--color-text-muted)';
}

function updateDetailedPriceInfo() {
  if (!selectedAsset) return;
  const p = engine.getPrice(selectedAsset.ticker);
  if (!p) return;

  const isUp = p.changePercent >= 0;
  DOM.detailPrice.textContent = formatPrice(p.price);
  DOM.detailPrice.className = isUp ? 'price-up' : 'price-down';

  const sign = isUp ? '+' : '';
  DOM.detailChange.textContent = `${sign}${formatPrice(Math.abs(p.change))} (${sign}${p.changePercent.toFixed(2)}%)`;
  DOM.detailChange.className = isUp ? 'price-up' : 'price-down';

  DOM.detailVolume.textContent = formatVolume(p.volume);
  DOM.detailMarketCap.textContent = selectedAsset.marketCap;
  
  updateEstimatedTotal();
}

function setTradingMode(mode) {
  tradingMode = mode;
  DOM.tradeTabBuy.classList.toggle('active', mode === 'buy');
  DOM.tradeTabSell.classList.toggle('active', mode === 'sell');
  
  DOM.tradeSubmitBtn.className = `trade-submit-btn ${mode}`;
  DOM.tradeSubmitBtn.textContent = mode === 'buy' ? `Buy ${selectedAsset.ticker}` : `Sell ${selectedAsset.ticker}`;
  
  DOM.tradeQty.value = 1;
  updateEstimatedTotal();
}

function updateEstimatedTotal() {
  if (!selectedAsset) return;
  const price = engine.getPrice(selectedAsset.ticker).price;
  const qty = parseInt(DOM.tradeQty.value) || 0;
  const total = price * qty;
  const discount = Store.getCommissionDiscount();
  const commission = total * 0.00015 * (1 - discount);
  const grandTotal = tradingMode === 'buy' ? total + commission : total - commission;

  const multiplier = Store.getProfitMultiplier();
  const bonusSuffix = (tradingMode === 'sell' && multiplier > 1.0)
    ? ` (+${Math.round((multiplier - 1.0) * 100)}% Bonus)`
    : '';
  DOM.tradeEstimatedTotal.innerHTML = `${formatPrice(grandTotal)}<span style="color: var(--color-gold); font-size: 11px; font-weight:700;">${bonusSuffix}</span>`;
  
  // Available Cash
  DOM.tradeAvailableCash.textContent = `$${Store.state.cash.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  // Owned Shares
  const holding = Store.getHolding(selectedAsset.ticker);
  DOM.tradeOwnedShares.textContent = holding ? `${holding.shares} shares (avg ${formatPrice(holding.avgPrice)})` : '0 shares';
}

/* ── Live Price Engine updates ─────────── */
function updatePricesInUI(prices) {
  // If detail sheet is active, refresh its price details
  if (selectedAsset) {
    updateDetailedPriceInfo();
    // Also append tick to current active chart if data updates
    const chartData = engine.getIntradayHistory(selectedAsset.ticker);
    if (currentChart && chartData.length > 0) {
      currentChart.setData(chartData);
    }
  }

  // Live update visible lists depending on active view
  if (activeTab === 'home') {
    renderHomeMovers();
    updatePortfolioSumInHome();
  } else if (activeTab === 'market') {
    updateMarketListPrices(prices);
  } else if (activeTab === 'portfolio' && portfolioSubTab === 'holdings') {
    renderPortfolioHoldings();
  }
}

function updatePortfolioSumInHome() {
  const currentPrices = engine.prices;
  const total = Store.getTotalAssets(currentPrices);
  const pnl = Store.getUnrealizedPnL(currentPrices);
  const pnlPercent = Store.state.cash + pnl > 0 ? (pnl / (total - pnl)) * 100 : 0;

  DOM.homeTotalAssets.textContent = `$${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  DOM.homeCash.textContent = `$${Store.state.cash.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  
  const sign = pnl >= 0 ? '+' : '';
  DOM.homeUnrealizedPnL.textContent = `${sign}$${pnl.toFixed(2)} (${sign}${pnlPercent.toFixed(2)}%)`;
  DOM.homeUnrealizedPnL.className = `assets-sub-val ${pnl >= 0 ? 'price-up' : 'price-down'}`;

  // Update Shopping cash indicators
  const realized = Store.state.realizedProfit;
  const spent = Store.state.spentOnItems;
  const shoppingBudget = Math.max(0, realized - spent);

  DOM.homeRealizedProfit.textContent = `$${realized.toFixed(2)}`;
  DOM.homeRealizedProfit.className = realized >= 0 ? 'price-up' : 'price-down';
  DOM.homeShoppingCash.textContent = `$${shoppingBudget.toFixed(2)}`;
}

function updateMarketListPrices(prices) {
  const items = DOM.marketList.querySelectorAll('.stock-item');
  items.forEach(el => {
    const ticker = el.dataset.ticker;
    const p = prices[ticker];
    if (p) {
      const priceEl = el.querySelector('.stock-price');
      const changeEl = el.querySelector('.stock-change');
      
      const isUp = p.changePercent >= 0;
      priceEl.textContent = formatPrice(p.price);
      priceEl.className = `stock-price ${isUp ? 'price-up' : 'price-down'}`;
      
      const sign = isUp ? '+' : '';
      changeEl.textContent = `${sign}${p.changePercent.toFixed(2)}%`;
      changeEl.className = `stock-change ${isUp ? 'bg-up' : 'bg-down'}`;
    }
  });
}

/* ── Rendering Functions per Tab ────────── */

// 1. HOME TAB
function renderHome() {
  updatePortfolioSumInHome();
  
  // Character preview render
  DOM.homeCharacterPreview.innerHTML = renderCharacter(Store.state.equipped, Store.state.characterCustom, 110);

  // Movers
  renderHomeMovers();
}

function renderHomeMovers() {
  const gainers = engine.getTopGainers(5);
  const losers = engine.getTopLosers(5);

  const renderMoversList = (assets, container) => {
    container.innerHTML = assets.map(a => {
      const isUp = a.changePercent >= 0;
      const sign = isUp ? '+' : '';
      return `
        <div class="stock-item" data-ticker="${a.ticker}" onclick="openAssetDetail('${a.ticker}')">
          <div class="stock-emoji">${a.emoji}</div>
          <div class="stock-info">
            <div class="stock-meta">
              <span class="stock-ticker">${a.ticker}</span>
            </div>
            <div class="stock-name">${a.name}</div>
          </div>
          <div class="stock-price-col">
            <div class="stock-price ${isUp ? 'price-up' : 'price-down'}">${formatPrice(a.price)}</div>
            <div class="stock-change ${isUp ? 'bg-up' : 'bg-down'}">${sign}${a.changePercent.toFixed(2)}%</div>
          </div>
        </div>
      `;
    }).join('');
  };

  renderMoversList(gainers, DOM.homeTopGainers);
  renderMoversList(losers, DOM.homeTopLosers);
}

// 2. MARKET TAB
let currentMarketTab = 'all'; // 'all', 'index', 'sector', 'watchlist'
let currentSectorFilter = null;

function renderMarket() {
  const searchVal = DOM.marketSearch.value.trim().toLowerCase();
  
  // Build sector tags if not already built
  renderSectorFilters();

  let list = getAllAssets();

  // Tab filter
  if (currentMarketTab === 'index') {
    list = list.filter(a => a.sector === 'Index Trackers');
  } else if (currentMarketTab === 'sector') {
    list = list.filter(a => a.sector !== 'Index Trackers');
  } else if (currentMarketTab === 'watchlist') {
    list = list.filter(a => Store.state.watchlist.includes(a.ticker));
  }

  // Sector filter
  if (currentSectorFilter) {
    list = list.filter(a => a.sector === currentSectorFilter);
  }

  // Search query filter
  if (searchVal) {
    list = list.filter(a => a.ticker.toLowerCase().includes(searchVal) || a.name.toLowerCase().includes(searchVal));
  }

  if (list.length === 0) {
    DOM.marketList.innerHTML = `<div class="empty-state">
      <div class="empty-emoji">🔍</div>
      <div>No results found</div>
    </div>`;
    return;
  }

  DOM.marketList.innerHTML = list.map(a => {
    const p = engine.getPrice(a.ticker);
    const priceVal = p ? p.price : a.basePrice;
    const changeVal = p ? p.changePercent : 0;
    const isUp = changeVal >= 0;
    const sign = isUp ? '+' : '';
    
    return `
      <div class="stock-item" data-ticker="${a.ticker}" onclick="openAssetDetail('${a.ticker}')">
        <div class="stock-emoji">${a.emoji}</div>
        <div class="stock-info">
          <div class="stock-meta">
            <span class="stock-ticker">${a.ticker}</span>
            <span class="badge ${a.sector === 'Crypto' ? 'badge-epic' : 'badge-rare'}" style="font-size: 10px; padding: 2px 5px;">${a.sector}</span>
          </div>
          <div class="stock-name">${a.name}</div>
        </div>
        <div class="stock-price-col">
          <div class="stock-price ${isUp ? 'price-up' : 'price-down'}">${formatPrice(priceVal)}</div>
          <div class="stock-change ${isUp ? 'bg-up' : 'bg-down'}">${sign}${changeVal.toFixed(2)}%</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderSectorFilters() {
  if (currentMarketTab === 'watchlist') {
    DOM.sectorFilters.style.display = 'none';
    return;
  }
  DOM.sectorFilters.style.display = 'flex';

  const sectors = getETFSectors();
  
  let html = `<div class="sector-chip ${!currentSectorFilter ? 'active' : ''}" data-sector="all">All Sectors</div>`;
  html += sectors.map(sec => {
    return `<div class="sector-chip ${currentSectorFilter === sec ? 'active' : ''}" data-sector="${sec}">${sec}</div>`;
  }).join('');

  DOM.sectorFilters.innerHTML = html;

  // Add click listeners to chips
  DOM.sectorFilters.querySelectorAll('.sector-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const sec = chip.dataset.sector;
      currentSectorFilter = sec === 'all' ? null : sec;
      renderSectorFilters();
      renderMarket();
    });
  });
}

// Market tab listeners hook (handled by setMarketFilter inside _bindEvents)

// 3. PORTFOLIO TAB
function renderPortfolio() {
  const total = Store.getTotalAssets(engine.prices);
  const pnl = Store.getUnrealizedPnL(engine.prices);
  const pnlPercent = (Store.state.cash + pnl) > 0 ? (pnl / (total - pnl)) * 100 : 0;

  DOM.portTotalAssets.textContent = `$${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  DOM.portCash.textContent = `$${Store.state.cash.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  
  const sign = pnl >= 0 ? '+' : '';
  DOM.portUnrealizedPnL.textContent = `${sign}$${pnl.toFixed(2)} (${sign}${pnlPercent.toFixed(2)}%)`;
  DOM.portUnrealizedPnL.className = `perf-val ${pnl >= 0 ? 'price-up' : 'price-down'}`;
  
  DOM.portRealizedProfit.textContent = `$${Store.state.realizedProfit.toFixed(2)}`;
  DOM.portRealizedProfit.className = `assets-sub-val ${Store.state.realizedProfit >= 0 ? 'price-up' : 'price-down'}`;

  if (portfolioSubTab === 'holdings') {
    renderPortfolioHoldings();
  } else {
    renderPortfolioHistory();
  }
}

function renderPortfolioHoldings() {
  const holdings = Store.state.holdings;
  if (holdings.length === 0) {
    DOM.portHoldingsList.innerHTML = `<div class="empty-state">
      <div class="empty-emoji">💼</div>
      <div>Your portfolio is empty.<br>Go to Market to buy stocks!</div>
    </div>`;
    return;
  }

  DOM.portHoldingsList.innerHTML = holdings.map(h => {
    const asset = getAssetByTicker(h.ticker);
    const p = engine.getPrice(h.ticker);
    if (!asset || !p) return '';

    const currentVal = p.price * h.shares;
    const costBasis = h.avgPrice * h.shares;
    const itemPnL = currentVal - costBasis;
    const itemPnLPercent = (itemPnL / costBasis) * 100;
    const isUp = itemPnL >= 0;
    const sign = isUp ? '+' : '';

    return `
      <div class="stock-item" data-ticker="${h.ticker}" onclick="openAssetDetail('${h.ticker}')">
        <div class="stock-emoji">${asset.emoji}</div>
        <div class="stock-info">
          <div class="stock-meta">
            <span class="stock-ticker">${h.ticker}</span>
            <span style="font-size: 11px; color: var(--color-text-muted);">${h.shares} shares @ ${formatPrice(h.avgPrice)}</span>
          </div>
          <div class="stock-name">${asset.name}</div>
        </div>
        <div class="stock-price-col">
          <div class="stock-price">${formatPrice(currentVal)}</div>
          <div class="stock-change ${isUp ? 'bg-up' : 'bg-down'}">${sign}${itemPnLPercent.toFixed(2)}%</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderPortfolioHistory() {
  const txs = Store.state.transactions;
  if (txs.length === 0) {
    DOM.portHistoryList.innerHTML = `<div class="empty-state">
      <div class="empty-emoji">📜</div>
      <div>No order history yet.</div>
    </div>`;
    return;
  }

  DOM.portHistoryList.innerHTML = txs.map(t => {
    const isBuy = t.type === 'BUY';
    const dateStr = new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' ' + new Date(t.timestamp).toLocaleDateString([], {month: 'short', day: 'numeric'});
    const profitHtml = !isBuy && t.profit !== undefined 
      ? `<div style="font-size: 10px; color: ${t.profit >= 0 ? 'var(--color-up)' : 'var(--color-down)'};">PnL: ${t.profit >= 0 ? '+' : '-'}${formatPrice(Math.abs(t.profit))}</div>` 
      : '';

    return `
      <div class="tx-item">
        <div class="tx-meta">
          <span class="tx-type" style="color: ${isBuy ? 'var(--color-up)' : 'var(--color-down)'};">${t.type} ${t.ticker}</span>
          <span class="tx-date">${dateStr}</span>
        </div>
        <div style="font-size: 12px; color: var(--color-text-muted); text-align: center;">
          ${t.shares} shares @ ${formatPrice(t.price)}
        </div>
        <div class="tx-val">
          ${formatPrice(t.total)}
          ${profitHtml}
        </div>
      </div>
    `;
  }).join('');
}

// 4. DECORATE TAB
function renderDecorate() {
  DOM.characterCardMain.innerHTML = renderCharacter(Store.state.equipped, Store.state.characterCustom, 240);
  
  const discount = Math.round(Store.getCommissionDiscount() * 100);
  const profitBonus = Math.round((Store.getProfitMultiplier() - 1.0) * 100);
  
  const bonusHtml = `
    <div style="position: absolute; bottom: 12px; left: 12px; right: 12px; background: rgba(13, 17, 23, 0.85); backdrop-filter: blur(4px); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); font-size: 11px; text-align: left; pointer-events: none;">
      <div style="color: #94a3b8; font-weight: 600; margin-bottom: 3px; font-size: 10px;">🌟 ACTIVE OUTFIT EFFECTS</div>
      <div style="display: flex; gap: 12px; color: #fff;">
        <div>수익 보너스: <span style="color: var(--color-gold); font-weight: 700;">+${profitBonus}%</span></div>
        <div>수수료 인하: <span style="color: #22c55e; font-weight: 700;">-${discount}%</span></div>
      </div>
    </div>
  `;
  DOM.characterCardMain.style.position = 'relative';
  DOM.characterCardMain.insertAdjacentHTML('beforeend', bonusHtml);
  
  const shoppingBudget = Store.getAvailableProfit();
  DOM.decoShoppingCash.textContent = `$${shoppingBudget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  renderDecoSubTabOptions();
}

function renderDecoSubTabOptions() {
  let html = '';
  const custom = Store.state.characterCustom;

  if (currentDecoSubTab === 'hairStyle') {
    html = HAIR_STYLES.map(style => {
      const active = custom.hairStyle === style.id ? 'active' : '';
      return `<div class="custom-option ${active}" onclick="setCustomPart('hairStyle', '${style.id}')" style="font-size: 12px; font-weight: 700; color: white;">
        ${style.name}
      </div>`;
    }).join('');
  } 
  else if (currentDecoSubTab === 'hairColor') {
    html = HAIR_COLORS.map(color => {
      const active = custom.hairColor === color ? 'active' : '';
      return `<div class="custom-option ${active}" onclick="setCustomPart('hairColor', '${color}')">
        <div class="color-blob" style="background: ${color};"></div>
      </div>`;
    }).join('');
  } 
  else if (currentDecoSubTab === 'skinColor') {
    html = SKIN_COLORS.map(color => {
      const active = custom.skinColor === color ? 'active' : '';
      return `<div class="custom-option ${active}" onclick="setCustomPart('skinColor', '${color}')">
        <div class="color-blob" style="background: ${color};"></div>
      </div>`;
    }).join('');
  } 
  else if (currentDecoSubTab === 'eyeColor') {
    html = EYE_COLORS.map(color => {
      const active = custom.eyeColor === color ? 'active' : '';
      return `<div class="custom-option ${active}" onclick="setCustomPart('eyeColor', '${color}')">
        <div class="color-blob" style="background: ${color};"></div>
      </div>`;
    }).join('');
  }

  DOM.customOptionsGrid.innerHTML = html;
}

window.setCustomPart = function(part, val) {
  Store.state.characterCustom[part] = val;
  Store.save();
  renderDecorate();
};

// 5. SHOP TAB
function renderShop() {
  const shoppingBudget = Store.getAvailableProfit();
  DOM.shopShoppingCash.textContent = `$${shoppingBudget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  // Render Category Tabs
  DOM.shopCategoriesContainer.innerHTML = CATEGORIES.map(c => {
    const active = currentShopCategory === c.id ? 'active' : '';
    return `<button class="shop-cat-btn ${active}" onclick="setShopCategory('${c.id}')">
      <span>${c.emoji}</span> ${c.name}
    </button>`;
  }).join('');

  // Render Items list
  const items = getItemsByCategory(currentShopCategory);

  DOM.shopItemsGrid.innerHTML = items.map(item => {
    const isOwned = Store.state.inventory.includes(item.id);
    const isEquipped = Store.state.equipped[item.category] === item.id;
    const rarityColor = RARITY_COLORS[item.rarity];
    
    const isPremiumItem = item.rarity === 'epic' || item.rarity === 'legendary';
    
    let btnHtml = '';
    if (isEquipped) {
      btnHtml = `<button class="shop-item-btn equipped">EQUIPPED</button>`;
    } else if (isOwned) {
      btnHtml = `<button class="shop-item-btn equip" onclick="equipOwnedItem('${item.id}', '${item.category}')">EQUIP</button>`;
    } else {
      const lockLabel = (isPremiumItem && localStorage.getItem('jisp_premium') !== 'true') ? ' 👑' : '';
      btnHtml = `<button class="shop-item-btn buy" onclick="buyShopItem('${item.id}', ${item.price})">BUY${lockLabel}</button>`;
    }

    const effectHtml = item.effect 
      ? `<div style="font-size: 9.5px; color: var(--color-gold); font-weight: 700; margin-bottom: 8px;">⚡ 효과: ${item.effect.description}</div>`
      : '';

    return `
      <div class="shop-item-card">
        <div class="item-rarity-indicator" style="background: ${rarityColor};"></div>
        <div class="shop-item-emoji">${item.emoji}</div>
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-price">$${item.price.toFixed(2)} profit</div>
        <div style="font-size: 10px; color: var(--color-text-muted); margin-bottom: 4px;">${item.description}</div>
        ${effectHtml}
        ${btnHtml}
      </div>
    `;
  }).join('');
}

window.buyShopItem = function(itemId, price) {
  const item = getItemById(itemId);
  const isPremiumItem = item && (item.rarity === 'epic' || item.rarity === 'legendary');
  if (isPremiumItem && localStorage.getItem('jisp_premium') !== 'true') {
    showToast('👑 VIP 아이템은 JISP Pro 회원만 구매할 수 있습니다!');
    if (window.openCheckout) window.openCheckout();
    return;
  }
  const res = Store.purchaseItem(itemId, price);
  if (res.ok) {
    showToast(`Purchased item successfully!`);
    const item = getItemById(itemId);
    if (item) {
      // Auto-equip
      Store.equipItem(item.category, item.id);
    }
    renderShop();
  } else {
    showToast(`Purchase failed: ${res.msg}`);
  }
};

window.equipOwnedItem = function(itemId, category) {
  Store.equipItem(category, itemId);
  showToast('Item equipped!');
  renderShop();
};

/* ── General Helper: Format Volume ──────── */
function formatVolume(val) {
  if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
  if (val >= 1e6) return (val / 1e6).toFixed(2) + 'M';
  if (val >= 1e3) return (val / 1e3).toFixed(1) + 'K';
  return val.toString();
}

// Debugging helper: Show uncaught errors directly in the UI as toasts
window.addEventListener('error', (event) => {
  const msg = `${event.message} at ${event.filename}:${event.lineno}`;
  console.error(msg);
  // Show toast if DOM is ready
  if (DOM && DOM.toastContainer) {
    showToast(`⚠️ JS Error: ${event.message}`);
  } else {
    alert(`⚠️ Critical Error: ${msg}`);
  }
});

// Start execution safely regardless of DOMContentLoaded state
try {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
      try {
        init();
      } catch (err) {
        alert("🚨 init DOMContentLoaded Error:\n" + err.stack);
      }
    });
  } else {
    init();
  }
} catch (err) {
  alert("🚨 top-level init Error:\n" + err.stack);
}

/* ── Global Rankings Mock Competitors & Logic ── */
const MOCK_COMPETITORS = [
  { name: 'Warren Buffett', assets: 950000, desc: 'Oracle of Omaha', equipped: { hat: 'hat_tophat', top: 'top_buffett', bottom: 'bottom_suit_pants', shoes: 'shoes_loafers', accessory: 'acc_monocle', background: 'bg_office' } },
  { name: 'Elon Musk', assets: 820000, desc: 'Technoking of Tesla', equipped: { hat: 'hat_cap_black', top: 'top_leather', bottom: 'bottom_jeans', shoes: 'shoes_boots', accessory: 'acc_rocket', background: 'bg_moon' } },
  { name: 'Jihoo Jung (JISP CEO)', assets: 42000, desc: 'Co-Founder & CEO of JISP Tech', equipped: { hat: 'hat_crown', top: 'top_suit_navy', bottom: 'bottom_suit_pants', shoes: 'shoes_diamond', accessory: 'acc_necklace', background: 'bg_trading' } },
  { name: 'Jiseob Won (JISP CTO)', assets: 45000, desc: 'Co-Founder & CTO of JISP Tech', equipped: { hat: 'hat_headphones', top: 'top_hoodie_gray', bottom: 'bottom_jeans', shoes: 'shoes_sneakers_white', accessory: 'acc_monocle', background: 'bg_trading' } },
  { name: 'Nancy Pelosi', assets: 250000, desc: 'Stock Market Oracle', equipped: { hat: 'hat_diamond', top: 'top_suit_navy', bottom: 'bottom_gold_pants', shoes: 'shoes_diamond', accessory: 'acc_monocle', background: 'bg_office' } },
  { name: 'WallStreet Quant', assets: 15000, desc: 'Hedge Fund Algorithm', equipped: { hat: 'hat_headphones', top: 'top_hoodie_gray', bottom: 'bottom_jeans', shoes: 'shoes_sneakers_white', accessory: 'acc_sunglasses', background: 'bg_trading' } },
  { name: 'DiamondHands100', assets: 5000, desc: 'Meme stock diamond hand', equipped: { hat: 'hat_cap_black', top: 'top_tshirt_green', bottom: 'bottom_jeans', shoes: 'shoes_sneakers_white', accessory: 'acc_rocket', background: 'bg_moon' } },
];

function renderRanking() {
  const currentPrices = engine.prices;
  const userTotalAssets = Store.getTotalAssets(currentPrices);
  
  DOM.userRankingAssets.textContent = `$${userTotalAssets.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  const userRaw = localStorage.getItem('jisp_user');
  let username = 'You (Guest)';
  if (userRaw) {
    try {
      username = JSON.parse(userRaw).username;
    } catch {}
  }
  
  const userCompetitor = {
    name: `${username}`,
    assets: userTotalAssets,
    desc: 'Your active trading account',
    isUser: true,
    equipped: Store.state.equipped,
    custom: Store.state.characterCustom
  };

  const allCompetitors = [...MOCK_COMPETITORS, userCompetitor];
  allCompetitors.sort((a, b) => b.assets - a.assets);

  const userRankIdx = allCompetitors.findIndex(c => c.isUser) + 1;
  let rankEmoji = '🏆';
  if (userRankIdx === 1) rankEmoji = '🥇';
  else if (userRankIdx === 2) rankEmoji = '🥈';
  else if (userRankIdx === 3) rankEmoji = '🥉';
  DOM.userCurrentRank.textContent = `${rankEmoji} #${userRankIdx} / ${allCompetitors.length}위`;

  DOM.rankingList.innerHTML = allCompetitors.map((c, idx) => {
    const rank = idx + 1;
    let badgeClass = 'rank-badge-number';
    let badgeText = rank.toString();
    if (rank === 1) { badgeClass += ' top-1'; badgeText = '🥇'; }
    else if (rank === 2) { badgeClass += ' top-2'; badgeText = '🥈'; }
    else if (rank === 3) { badgeClass += ' top-3'; badgeText = '🥉'; }

    const isUserClass = c.isUser ? 'style="background: rgba(59, 130, 246, 0.08); border-color: rgba(59, 130, 246, 0.2);"' : '';
    const avatarSvg = renderCharacter(c.equipped, c.custom || { skinColor: '#FFDCB5', hairStyle: 'short', hairColor: '#4A3728' }, 38);

    return `
      <div class="stock-item" ${isUserClass}>
        <div class="rank-badge-col">
          <span class="${badgeClass}">${badgeText}</span>
        </div>
        <div class="rank-item-avatar">
          ${avatarSvg}
        </div>
        <div class="stock-info">
          <div class="stock-meta">
            <span class="stock-ticker" style="font-size: 13px; font-weight: 700;">${c.name}</span>
          </div>
          <div class="stock-name" style="font-size: 11px;">${c.desc}</div>
        </div>
        <div class="stock-price-col">
          <div class="stock-price" style="font-size: 14px; font-weight: 800;">$${c.assets.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          <div style="font-size: 10px; color: var(--color-gold); font-weight: 700; text-align: right;">${c.isUser ? 'ACTIVE' : 'BOT'}</div>
        </div>
      </div>
    `;
  }).join('');
}
