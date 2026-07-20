// ─── State Management + LocalStorage ─────────────────────────────
import { ITEM_EFFECTS } from './character.js';
const STORAGE_KEY = 'mock_stock_app_smallcap_v1';

const DEFAULT_STATE = {
  cash: 1000,
  holdings: [],           // [{ ticker, shares, avgPrice }]
  realizedProfit: 0,      // cumulative realized trading profit
  spentOnItems: 0,        // cumulative spent on character items
  inventory: [],          // purchased item IDs
  equipped: {
    hat: null,
    top: null,
    bottom: null,
    shoes: null,
    accessory: null,
    background: null,
  },
  characterCustom: {
    skinColor: '#FFDCB5',
    hairStyle: 'default',
    hairColor: '#4A3728',
    eyeColor: '#2C1810',
  },
  transactions: [],       // [{ type, ticker, name, shares, price, total, timestamp }]
  watchlist: [],          // ticker strings
};

class StateStore {
  constructor() {
    this.state = null;
    this._listeners = [];
  }

  /* ── Lifecycle ────────────────────────── */
  init() {
    const userRaw = localStorage.getItem('jisp_user');
    let username = '';
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        if (user && user.username) {
          username = user.username;
        }
      } catch {}
    }
    
    if (localStorage.getItem('jisp_premium') === null) {
      localStorage.setItem('jisp_premium', 'false');
    }
    
    if (username) {
      this.currentStorageKey = `${STORAGE_KEY}_user_${username}`;
      if (localStorage.getItem(`jisp_user_premium_${username}`) === null) {
        localStorage.setItem(`jisp_user_premium_${username}`, 'false');
      }
      const userPremium = localStorage.getItem(`jisp_user_premium_${username}`) === 'true';
      localStorage.setItem('jisp_premium', userPremium ? 'true' : 'false');
    } else {
      this.currentStorageKey = STORAGE_KEY;
    }

    const raw = localStorage.getItem(this.currentStorageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.state = {
          ...structuredClone(DEFAULT_STATE),
          ...parsed,
          equipped: { ...DEFAULT_STATE.equipped, ...(parsed.equipped || {}) },
          characterCustom: { ...DEFAULT_STATE.characterCustom, ...(parsed.characterCustom || {}) },
          holdings: parsed.holdings || [],
          inventory: parsed.inventory || [],
          transactions: parsed.transactions || [],
          watchlist: parsed.watchlist || [],
        };
      } catch {
        this.state = structuredClone(DEFAULT_STATE);
      }
    } else {
      this.state = structuredClone(DEFAULT_STATE);
    }
    return this.state;
  }

  save() {
    localStorage.setItem(this.currentStorageKey || STORAGE_KEY, JSON.stringify(this.state));
    this.syncPremiumStatus();
    for (const fn of this._listeners) fn(this.state);
  }

  reset() {
    localStorage.removeItem(this.currentStorageKey || STORAGE_KEY);
    this.state = structuredClone(DEFAULT_STATE);
    this.save();
    return this.state;
  }

  getCommissionDiscount() {
    let discount = 0;
    for (const slot in this.state.equipped) {
      const itemId = this.state.equipped[slot];
      if (itemId && ITEM_EFFECTS[itemId] && ITEM_EFFECTS[itemId].commissionDiscount) {
        discount = Math.max(discount, ITEM_EFFECTS[itemId].commissionDiscount);
      }
    }
    return discount;
  }

  getProfitMultiplier() {
    let multiplier = 1.0;
    for (const slot in this.state.equipped) {
      const itemId = this.state.equipped[slot];
      if (itemId && ITEM_EFFECTS[itemId] && ITEM_EFFECTS[itemId].profitMultiplier) {
        multiplier += (ITEM_EFFECTS[itemId].profitMultiplier - 1.0);
      }
    }
    return multiplier;
  }

  syncPremiumStatus() {
    const userRaw = localStorage.getItem('jisp_user');
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        if (user && user.username) {
          const isPremium = localStorage.getItem('jisp_premium') === 'true';
          localStorage.setItem(`jisp_user_premium_${user.username}`, isPremium ? 'true' : 'false');
        }
      } catch {}
    }
  }

  onChange(fn) {
    this._listeners.push(fn);
  }

  /* ── Derived getters ──────────────────── */
  getAvailableProfit() {
    return Math.max(0, this.state.realizedProfit - this.state.spentOnItems);
  }

  getTotalAssets(priceMap) {
    let stockValue = 0;
    for (const h of this.state.holdings) {
      const p = priceMap[h.ticker];
      if (p) stockValue += p.price * h.shares;
    }
    return this.state.cash + stockValue;
  }

  getUnrealizedPnL(priceMap) {
    let pnl = 0;
    for (const h of this.state.holdings) {
      const p = priceMap[h.ticker];
      if (p) pnl += (p.price - h.avgPrice) * h.shares;
    }
    return pnl;
  }

  getHolding(ticker) {
    return this.state.holdings.find(h => h.ticker === ticker) || null;
  }

  /* ── Trading helpers ──────────────────── */
  buy(ticker, name, shares, price) {
    const totalCost = shares * price;
    const discount = this.getCommissionDiscount();
    const commission = totalCost * 0.00015 * (1 - discount);
    const total = totalCost + commission;

    if (total > this.state.cash) return { ok: false, msg: 'Insufficient funds' };
    if (shares <= 0) return { ok: false, msg: 'Invalid quantity' };

    this.state.cash -= total;

    const existing = this.state.holdings.find(h => h.ticker === ticker);
    if (existing) {
      const newTotal = existing.shares * existing.avgPrice + shares * price;
      existing.shares += shares;
      existing.avgPrice = newTotal / existing.shares;
    } else {
      this.state.holdings.push({ ticker, shares, avgPrice: price });
    }

    this.state.transactions.unshift({
      type: 'BUY',
      ticker,
      name,
      shares,
      price,
      total: +total.toFixed(2),
      commission: +commission.toFixed(2),
      timestamp: Date.now(),
    });

    this.save();
    return { ok: true, msg: `Bought ${shares} ${ticker} @ $${price.toFixed(2)}` };
  }

  sell(ticker, name, shares, price) {
    const existing = this.state.holdings.find(h => h.ticker === ticker);
    if (!existing || existing.shares < shares) return { ok: false, msg: 'Not enough shares' };
    if (shares <= 0) return { ok: false, msg: 'Invalid quantity' };

    const totalRevenue = shares * price;
    const discount = this.getCommissionDiscount();
    const commission = totalRevenue * 0.00015 * (1 - discount);
    const net = totalRevenue - commission;

    const baseProfit = (price - existing.avgPrice) * shares;
    const multiplier = this.getProfitMultiplier();
    const profit = baseProfit > 0 
      ? (baseProfit * multiplier - commission)
      : (baseProfit - commission);
    
    this.state.realizedProfit += profit;
    this.state.cash += net;

    existing.shares -= shares;
    if (existing.shares <= 0) {
      this.state.holdings = this.state.holdings.filter(h => h.ticker !== ticker);
    }

    this.state.transactions.unshift({
      type: 'SELL',
      ticker,
      name,
      shares,
      price,
      total: +net.toFixed(2),
      profit: +profit.toFixed(2),
      commission: +commission.toFixed(2),
      timestamp: Date.now(),
    });

    this.save();
    return { ok: true, msg: `Sold ${shares} ${ticker} @ $${price.toFixed(2)}`, profit };
  }

  /* ── Character / Shop helpers ─────────── */
  purchaseItem(itemId, price) {
    const available = this.getAvailableProfit();
    if (price > available) return { ok: false, msg: 'Not enough profit' };
    if (this.state.inventory.includes(itemId)) return { ok: false, msg: 'Already owned' };

    this.state.spentOnItems += price;
    this.state.inventory.push(itemId);

    if (ITEM_EFFECTS[itemId] && ITEM_EFFECTS[itemId].seedBonus) {
      const bonus = ITEM_EFFECTS[itemId].seedBonus;
      this.state.cash += bonus;
      this.state.transactions.unshift({
        type: 'GRANT',
        ticker: 'BONUS',
        name: `${ITEM_EFFECTS[itemId].description} (아이템 구매 보너스)`,
        shares: 0,
        price: bonus,
        total: bonus,
        timestamp: Date.now()
      });
    }

    this.save();
    return { ok: true };
  }

  equipItem(slot, itemId) {
    this.state.equipped[slot] = itemId;
    this.save();
  }

  unequipItem(slot) {
    this.state.equipped[slot] = null;
    this.save();
  }

  toggleWatchlist(ticker) {
    const idx = this.state.watchlist.indexOf(ticker);
    if (idx >= 0) {
      this.state.watchlist.splice(idx, 1);
    } else {
      this.state.watchlist.push(ticker);
    }
    this.save();
  }
}

export const Store = new StateStore();
