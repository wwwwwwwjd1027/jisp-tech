// ─── Market Simulation Engine (GBM-based) with Persistence ──────
// Prices are saved to localStorage so they don't jump on refresh.

const PRICE_STORAGE_KEY = 'engine_state_v2';
const SAVE_INTERVAL = 15; // save every 15 ticks (~30s)

function roundPrice(val) {
  if (val <= 0) return 0;
  if (val < 0.001) return +val.toFixed(8);
  if (val < 0.1) return +val.toFixed(5);
  if (val < 1.0) return +val.toFixed(4);
  return +val.toFixed(2);
}

export class MarketEngine {
  constructor(assets) {
    this.assets = assets;
    this.prices = {};
    this.priceHistory = {};
    this.intradayHistory = {};
    this._listeners = [];
    this._interval = null;
    this._tickCount = 0;

    // Try to restore saved state first
    const saved = this._loadState();
    if (saved && saved.prices && Object.keys(saved.prices).length > 0) {
      this.prices = saved.prices;
      this.priceHistory = saved.priceHistory || {};
      this.intradayHistory = saved.intradayHistory || {};
      // Init any new assets not in saved state
      for (const asset of assets) {
        if (!this.prices[asset.ticker]) {
          this._initAsset(asset);
        }
        if (!this.priceHistory[asset.ticker]) {
          this._generateHistory(asset, this.prices[asset.ticker]?.price || asset.basePrice);
        }
        if (!this.intradayHistory[asset.ticker]) {
          this._generateIntraday(asset, this.prices[asset.ticker]?.price || asset.basePrice);
        }
      }
    } else {
      for (const asset of assets) {
        this._initAsset(asset);
      }
      this._saveState();
    }
  }

  /* ── Persistence ──────────────────────── */
  _loadState() {
    try {
      const raw = localStorage.getItem(PRICE_STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Check if data is stale (> 24 hours old) → regenerate
      if (data.timestamp && Date.now() - data.timestamp > 86400000) return null;
      return data;
    } catch { return null; }
  }

  _saveState() {
    try {
      // Only save prices and minimal history to avoid localStorage quota
      const trimmedHistory = {};
      const trimmedIntraday = {};
      for (const ticker in this.priceHistory) {
        trimmedHistory[ticker] = this.priceHistory[ticker].slice(-60);
      }
      for (const ticker in this.intradayHistory) {
        trimmedIntraday[ticker] = this.intradayHistory[ticker].slice(-120);
      }
      localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify({
        prices: this.prices,
        priceHistory: trimmedHistory,
        intradayHistory: trimmedIntraday,
        timestamp: Date.now(),
      }));
    } catch { /* quota exceeded – ignore */ }
  }

  /* ── Initialization ───────────────────── */
  _initAsset(asset) {
    const price = asset.basePrice;
    this.prices[asset.ticker] = {
      price: roundPrice(price),
      prevClose: roundPrice(price * (1 - (Math.random() - 0.5) * 0.01)),
      open: roundPrice(price * (1 + (Math.random() - 0.5) * 0.005)),
      high: roundPrice(price * (1 + Math.random() * 0.01)),
      low: roundPrice(price * (1 - Math.random() * 0.01)),
      change: 0,
      changePercent: 0,
      volume: Math.floor(Math.random() * 5000000) + 500000,
      bid: roundPrice(price * 0.999),
      ask: roundPrice(price * 1.001),
    };
    const pd = this.prices[asset.ticker];
    pd.change = roundPrice(pd.price - pd.prevClose);
    pd.changePercent = pd.prevClose > 0 ? +((pd.change / pd.prevClose) * 100).toFixed(2) : 0;

    this._generateHistory(asset, price);
    this._generateIntraday(asset, price);
  }

  _generateHistory(asset, currentPrice) {
    let price = currentPrice * (0.92 + Math.random() * 0.16);
    const history = [];
    const now = Date.now();
    for (let i = 59; i >= 0; i--) {
      const open = price;
      const dailyReturn = (Math.random() - 0.48) * asset.volatility * 1.5;
      const close = Math.max(0.0000000001, open * (1 + dailyReturn));
      const spread = asset.volatility * 0.4;
      const high = Math.max(open, close) * (1 + Math.random() * spread);
      const low = Math.min(open, close) * (1 - Math.random() * spread);
      history.push({
        time: now - i * 86400000,
        open: roundPrice(open), high: roundPrice(high),
        low: roundPrice(low), close: roundPrice(close),
        volume: Math.floor(Math.random() * 5000000) + 500000,
      });
      price = close;
    }
    this.priceHistory[asset.ticker] = history;
  }

  _generateIntraday(asset, currentPrice) {
    const intraday = [];
    let ip = currentPrice;
    const now = Date.now();
    for (let i = 119; i >= 0; i--) {
      const io = ip;
      const ir = (Math.random() - 0.5) * asset.volatility * 0.2;
      const ic = Math.max(0.0000000001, io * (1 + ir));
      intraday.push({
        time: now - i * 60000,
        open: roundPrice(io), high: roundPrice(Math.max(io, ic)),
        low: roundPrice(Math.min(io, ic)), close: roundPrice(ic),
        volume: Math.floor(Math.random() * 50000) + 5000,
      });
      ip = ic;
    }
    this.intradayHistory[asset.ticker] = intraday;
  }

  /* ── Price Tick (called every ~2s) ────── */
  tick() {
    this._tickCount++;
    const sectorSentiment = {};

    for (const asset of this.assets) {
      if (!sectorSentiment[asset.sector]) {
        sectorSentiment[asset.sector] = (Math.random() - 0.5) * 0.002;
      }
      const pd = this.prices[asset.ticker];
      if (!pd) continue;
      const prev = pd.price;

      const ticksPerDay = 390 * 30;
      const sigma = asset.volatility / Math.sqrt(ticksPerDay);
      const mu = 0.00003;
      const z = this._boxMuller();
      const sectorEffect = sectorSentiment[asset.sector];
      const drift = (mu - 0.5 * sigma * sigma) + sectorEffect;
      const diffusion = sigma * z;
      let newPrice = prev * Math.exp(drift + diffusion);

      if (Math.random() < 0.0003) {
        newPrice *= (1 + (Math.random() - 0.4) * 0.04);
      }
      newPrice = Math.max(0.0000000001, newPrice);

      pd.price = roundPrice(newPrice);
      pd.high = Math.max(pd.high, newPrice);
      pd.low = Math.min(pd.low, newPrice);
      pd.volume += Math.floor(Math.random() * 500);
      pd.bid = roundPrice(newPrice * 0.999);
      pd.ask = roundPrice(newPrice * 1.001);
      const dayChange = newPrice - pd.prevClose;
      pd.change = roundPrice(dayChange);
      pd.changePercent = pd.prevClose > 0 ? +((dayChange / pd.prevClose) * 100).toFixed(2) : 0;
    }

    if (this._tickCount % 30 === 0) {
      for (const asset of this.assets) {
        const pd = this.prices[asset.ticker];
        if (!pd) continue;
        const history = this.intradayHistory[asset.ticker];
        if (!history) continue;
        history.push({ time: Date.now(), open: pd.open, high: pd.high, low: pd.low, close: pd.price, volume: pd.volume });
        if (history.length > 500) history.shift();
      }
    }

    if (this._tickCount % SAVE_INTERVAL === 0) {
      this._saveState();
    }

    for (const fn of this._listeners) fn(this.prices);
  }

  _boxMuller() {
    return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
  }

  /* ── Public API ───────────────────────── */
  start(intervalMs = 2000) { if (!this._interval) this._interval = setInterval(() => this.tick(), intervalMs); }
  stop() { if (this._interval) { clearInterval(this._interval); this._interval = null; } }
  onPriceUpdate(fn) { this._listeners.push(fn); }
  getPrice(ticker) { return this.prices[ticker] || null; }
  getDailyHistory(ticker) { return this.priceHistory[ticker] || []; }
  getIntradayHistory(ticker) { return this.intradayHistory[ticker] || []; }

  getTopMovers(count = 10) {
    return this.assets.map(a => ({ ...a, ...this.prices[a.ticker] }))
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, count);
  }
  getTopGainers(count = 5) {
    return this.assets.map(a => ({ ...a, ...this.prices[a.ticker] }))
      .sort((a, b) => b.changePercent - a.changePercent).slice(0, count);
  }
  getTopLosers(count = 5) {
    return this.assets.map(a => ({ ...a, ...this.prices[a.ticker] }))
      .sort((a, b) => a.changePercent - b.changePercent).slice(0, count);
  }
  searchAssets(query) {
    const q = query.toLowerCase();
    return this.assets.filter(a => a.ticker.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
  }
  getAssetsBySector(sector) { return this.assets.filter(a => a.sector === sector); }
}
