// ─── ETF Database ──────────────────────────────────────────
export const ETFS = [
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF', sector: 'Index Trackers', basePrice: 542.12, volatility: 0.015, marketCap: '530B', emoji: '🇺🇸', description: 'Tracks the S&P 500 Index, representing the 500 largest US companies.' },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust', sector: 'Index Trackers', basePrice: 478.50, volatility: 0.022, marketCap: '250B', emoji: '🚀', description: 'Tracks the Nasdaq-100 Index, heavily weighted towards technology giants.' },
  { ticker: 'DIA', name: 'SPDR Dow Jones Industrial', sector: 'Index Trackers', basePrice: 395.20, volatility: 0.013, marketCap: '32B', emoji: '🏛️', description: 'Tracks the Dow Jones Industrial Average, featuring 30 blue-chip stocks.' },
  { ticker: 'IWM', name: 'iShares Russell 2000', sector: 'Index Trackers', basePrice: 205.10, volatility: 0.025, marketCap: '60B', emoji: '📦', description: 'Tracks small-cap US equities, representing domestic growth potential.' },
  { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', sector: 'Index Trackers', basePrice: 498.15, volatility: 0.015, marketCap: '480B', emoji: '⚓', description: 'Low-cost S&P 500 index tracking fund by Vanguard.' },
  { ticker: 'VEA', name: 'Vanguard Developed Markets', sector: 'International Equities', basePrice: 48.90, volatility: 0.018, marketCap: '120B', emoji: '🇪🇺', description: 'Tracks developed markets outside North America (Europe, Japan, Australia).' },
  { ticker: 'VWO', name: 'Vanguard FTSE Emerging Markets', sector: 'International Equities', basePrice: 41.50, volatility: 0.024, marketCap: '78B', emoji: '🇨🇳', description: 'Tracks emerging market equities (China, India, Brazil, Taiwan).' },
  { ticker: 'GLD', name: 'SPDR Gold Shares', sector: 'Commodities', basePrice: 220.45, volatility: 0.012, marketCap: '68B', emoji: '✨', description: 'Reflects the performance of the price of gold bullion.' },
  { ticker: 'SLV', name: 'iShares Silver Trust', sector: 'Commodities', basePrice: 27.80, volatility: 0.028, marketCap: '14B', emoji: '🪙', description: 'Tracks the physical spot price of silver.' },
  { ticker: 'USO', name: 'United States Oil Fund', sector: 'Commodities', basePrice: 75.30, volatility: 0.045, marketCap: '2.5B', emoji: '🛢️', description: 'Reflects the price of West Texas Intermediate (WTI) light, sweet crude oil.' },
  { ticker: 'UNG', name: 'United States Natural Gas', sector: 'Commodities', basePrice: 15.60, volatility: 0.065, marketCap: '0.9B', emoji: '🔥', description: 'Tracks the spot price of natural gas.' },
  { ticker: 'TLT', name: 'iShares 20+ Year Treasury', sector: 'Fixed Income', basePrice: 94.20, volatility: 0.016, marketCap: '50B', emoji: '💵', description: 'Tracks long-term US Treasury bonds, highly sensitive to interest rates.' },
  { ticker: 'LQD', name: 'iShares Investment Grade Corp', sector: 'Fixed Income', basePrice: 108.50, volatility: 0.011, marketCap: '38B', emoji: '🏢', description: 'Tracks high-quality corporate bonds issued by top US companies.' },
  { ticker: 'HYG', name: 'iShares High Yield Corporate', sector: 'Fixed Income', basePrice: 77.20, volatility: 0.018, marketCap: '18B', emoji: '⚠️', description: 'Tracks non-investment grade (high-yield/junk) corporate bonds.' },
  { ticker: 'VNQ', name: 'Vanguard Real Estate ETF', sector: 'Real Estate', basePrice: 84.60, volatility: 0.022, marketCap: '33B', emoji: '🏢', description: 'Tracks US real estate investment trusts (REITs).' },
  { ticker: 'XLK', name: 'Technology Select Sector SPDR', sector: 'Sector ETFs', basePrice: 215.40, volatility: 0.024, marketCap: '65B', emoji: '💻', description: 'Focuses strictly on technology companies like Microsoft, Apple, Nvidia.' },
  { ticker: 'XLF', name: 'Financial Select Sector SPDR', sector: 'Sector ETFs', basePrice: 41.80, volatility: 0.016, marketCap: '34B', emoji: '🏦', description: 'Focuses on financial institutions, banks, insurance, brokerage.' },
  { ticker: 'XLV', name: 'Health Care Select Sector SPDR', sector: 'Sector ETFs', basePrice: 142.30, volatility: 0.012, marketCap: '40B', emoji: '🏥', description: 'Tracks healthcare equipment, pharmaceuticals, biotech companies.' },
  { ticker: 'XLE', name: 'Energy Select Sector SPDR', sector: 'Sector ETFs', basePrice: 88.50, volatility: 0.035, marketCap: '38B', emoji: '⚡', description: 'Focuses on oil, gas, and energy firms like ExxonMobil and Chevron.' },
  { ticker: 'XLY', name: 'Consumer Discretionary SPDR', sector: 'Sector ETFs', basePrice: 178.20, volatility: 0.022, marketCap: '20B', emoji: '🛍️', description: 'Tracks retail, hotel, automotive, and luxury brands (Amazon, Tesla).' },
  { ticker: 'XLP', name: 'Consumer Staples Select SPDR', sector: 'Sector ETFs', basePrice: 75.90, volatility: 0.010, marketCap: '16B', emoji: '🛒', description: 'Tracks defensive consumer goods companies (Coca-Cola, Walmart, P&G).' },
  { ticker: 'XLI', name: 'Industrial Select Sector SPDR', sector: 'Sector ETFs', basePrice: 122.40, volatility: 0.015, marketCap: '15B', emoji: '⚙️', description: 'Tracks aerospace, defense, machinery, transportation companies.' },
  { ticker: 'XLB', name: 'Materials Select Sector SPDR', sector: 'Sector ETFs', basePrice: 85.10, volatility: 0.018, marketCap: '6B', emoji: '🧱', description: 'Tracks chemical, metal, forestry, and packaging firms.' },
  { ticker: 'XLU', name: 'Utilities Select Sector SPDR', sector: 'Sector ETFs', basePrice: 68.30, volatility: 0.009, marketCap: '14B', emoji: '🚰', description: 'Tracks gas, water, electric utility providers; highly defensive.' },
  { ticker: 'XLRE', name: 'Real Estate Select Sector SPDR', sector: 'Real Estate', basePrice: 38.10, volatility: 0.020, marketCap: '5B', emoji: '🏗️', description: 'Tracks real estate companies and management REITs.' },
  { ticker: 'SOXX', name: 'iShares Semiconductor ETF', sector: 'Sector ETFs', basePrice: 224.50, volatility: 0.038, marketCap: '15B', emoji: '🔌', description: 'Tracks US semiconductor manufacturers and designers.' },
  { ticker: 'ARKK', name: 'ARK Innovation ETF', sector: 'Sector ETFs', basePrice: 42.15, volatility: 0.048, marketCap: '6B', emoji: '🔮', description: 'Active fund tracking disruptive innovation (genomics, fintech, robotics).' },
  { ticker: 'SOXL', name: 'Direxion Daily Semiconductor Bull 3X', sector: 'Leveraged ETFs', basePrice: 38.50, volatility: 0.114, marketCap: '9.5B', emoji: '⚡', description: '3x leveraged semiconductor bull ETF. Magnifies daily chip moves by 300%. High volatility.' },
  { ticker: 'KORU', name: 'Direxion Daily South Korea Bull 3X', sector: 'Leveraged ETFs', basePrice: 14.80, volatility: 0.084, marketCap: '0.15B', emoji: '🇰🇷', description: '3x leveraged South Korea bull ETF. Magnifies MSCI South Korea index daily returns by 3x.' },
  { ticker: 'TQQQ', name: 'ProShares UltraPro QQQ 3X Shares', sector: 'Leveraged ETFs', basePrice: 68.40, volatility: 0.066, marketCap: '22B', emoji: '📈', description: '3x leveraged Nasdaq-100 bull ETF. Magnifies tech giants daily index returns by 300%.' },
  { ticker: 'SQQQ', name: 'ProShares UltraPro Short QQQ -3X', sector: 'Leveraged ETFs', basePrice: 12.20, volatility: 0.066, marketCap: '3.1B', emoji: '📉', description: '3x inverse (-3x) leveraged Nasdaq-100 bear ETF. Moves opposite to the Nasdaq-100 index.' }
];

export function getAllAssets() { return ETFS; }
export function getAssetByTicker(ticker) { return ETFS.find(a => a.ticker === ticker); }
export function getETFSectors() { return [...new Set(ETFS.map(s => s.sector))]; }
