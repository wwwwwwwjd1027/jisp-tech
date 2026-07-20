// ─── Small-Cap / Micro-Cap Stocks + Meme Coins Data ──────────────
// This version focuses on high-volatility small/micro-cap stocks and meme coins.

export const STOCKS = [
  // ─── SMALL CAP ($300M - $2B) ─────────────────────
  { ticker: 'SOFI', name: 'SoFi Technologies', sector: 'Finance', basePrice: 18.64, volatility: 0.045, marketCap: '8B', emoji: '🏦' },
  { ticker: 'CLOV', name: 'Clover Health', sector: 'Healthcare', basePrice: 1.80, volatility: 0.065, marketCap: '800M', emoji: '🍀' },
  { ticker: 'WISH', name: 'ContextLogic (Wish)', sector: 'Consumer', basePrice: 3.20, volatility: 0.072, marketCap: '400M', emoji: '⭐' },
  { ticker: 'BB', name: 'BlackBerry Limited', sector: 'Technology', basePrice: 3.80, volatility: 0.048, marketCap: '2.2B', emoji: '📱' },
  { ticker: 'NOK', name: 'Nokia Corporation', sector: 'Technology', basePrice: 4.20, volatility: 0.032, marketCap: '2.3B', emoji: '📞' },
  { ticker: 'TLRY', name: 'Tilray Brands', sector: 'Healthcare', basePrice: 2.10, volatility: 0.062, marketCap: '1.5B', emoji: '🌿' },
  { ticker: 'SNDL', name: 'SNDL Inc.', sector: 'Healthcare', basePrice: 1.55, volatility: 0.068, marketCap: '600M', emoji: '🌱' },
  { ticker: 'WKHS', name: 'Workhorse Group', sector: 'Industrial', basePrice: 0.85, volatility: 0.078, marketCap: '300M', emoji: '🐴' },
  { ticker: 'NKLA', name: 'Nikola Corporation', sector: 'Industrial', basePrice: 0.65, volatility: 0.082, marketCap: '450M', emoji: '🚛' },
  { ticker: 'GOEV', name: 'Canoo Inc.', sector: 'Consumer', basePrice: 0.35, volatility: 0.090, marketCap: '200M', emoji: '🚐' },
  { ticker: 'SPCE', name: 'Virgin Galactic', sector: 'Industrial', basePrice: 1.80, volatility: 0.075, marketCap: '700M', emoji: '🚀' },
  { ticker: 'OPEN', name: 'Opendoor Technologies', sector: 'Real Estate', basePrice: 2.40, volatility: 0.058, marketCap: '1.5B', emoji: '🏠' },
  { ticker: 'SKLZ', name: 'Skillz Inc.', sector: 'Technology', basePrice: 0.55, volatility: 0.085, marketCap: '250M', emoji: '🎮' },
  { ticker: 'ASTS', name: 'AST SpaceMobile', sector: 'Communication', basePrice: 67.15, volatility: 0.065, marketCap: '5B', emoji: '📡' },
  { ticker: 'IONQ', name: 'IonQ, Inc.', sector: 'Technology', basePrice: 12.40, volatility: 0.068, marketCap: '2.8B', emoji: '⚛️' },
  { ticker: 'RKLB', name: 'Rocket Lab USA', sector: 'Industrial', basePrice: 6.50, volatility: 0.055, marketCap: '3.2B', emoji: '🚀' },
  { ticker: 'JOBY', name: 'Joby Aviation', sector: 'Industrial', basePrice: 5.80, volatility: 0.062, marketCap: '3.5B', emoji: '🛩️' },
  { ticker: 'MVST', name: 'Microvast Holdings', sector: 'Industrial', basePrice: 1.20, volatility: 0.072, marketCap: '400M', emoji: '🔋' },
  { ticker: 'QS', name: 'QuantumScape Corp.', sector: 'Technology', basePrice: 6.20, volatility: 0.065, marketCap: '3B', emoji: '🔋' },
  { ticker: 'LAZR', name: 'Luminar Technologies', sector: 'Technology', basePrice: 3.50, volatility: 0.068, marketCap: '1.2B', emoji: '💡' },
  { ticker: 'LIDR', name: 'AEye Inc.', sector: 'Technology', basePrice: 0.80, volatility: 0.085, marketCap: '300M', emoji: '👁️' },
  { ticker: 'DNA', name: 'Ginkgo Bioworks', sector: 'Healthcare', basePrice: 0.35, volatility: 0.088, marketCap: '700M', emoji: '🧬' },
  { ticker: 'ME', name: '23andMe Holding', sector: 'Healthcare', basePrice: 0.25, volatility: 0.092, marketCap: '200M', emoji: '🧬' },
  { ticker: 'BARK', name: 'BARK, Inc.', sector: 'Consumer', basePrice: 1.10, volatility: 0.058, marketCap: '200M', emoji: '🐕' },
  { ticker: 'BYND', name: 'Beyond Meat', sector: 'Consumer', basePrice: 6.50, volatility: 0.062, marketCap: '420M', emoji: '🌱' },
  { ticker: 'NNDM', name: 'Nano Dimension', sector: 'Technology', basePrice: 2.80, volatility: 0.055, marketCap: '700M', emoji: '🖨️' },
  { ticker: 'DM', name: 'Desktop Metal', sector: 'Technology', basePrice: 3.20, volatility: 0.058, marketCap: '800M', emoji: '🖨️' },
  { ticker: 'BFLY', name: 'Butterfly Network', sector: 'Healthcare', basePrice: 1.50, volatility: 0.062, marketCap: '300M', emoji: '🦋' },
  { ticker: 'GENI', name: 'Genius Sports', sector: 'Technology', basePrice: 5.20, volatility: 0.048, marketCap: '1.2B', emoji: '⚽' },
  { ticker: 'MAPS', name: 'WM Technology', sector: 'Technology', basePrice: 0.60, volatility: 0.075, marketCap: '120M', emoji: '🗺️' },
  { ticker: 'IRNT', name: 'IronNet Cybersecurity', sector: 'Technology', basePrice: 0.45, volatility: 0.088, marketCap: '80M', emoji: '🛡️' },
  { ticker: 'RDW', name: 'Redwire Corporation', sector: 'Industrial', basePrice: 8.50, volatility: 0.062, marketCap: '600M', emoji: '🌍' },
  { ticker: 'BNGO', name: 'Bionano Genomics', sector: 'Healthcare', basePrice: 0.40, volatility: 0.085, marketCap: '150M', emoji: '🧬' },
  { ticker: 'GEVO', name: 'Gevo, Inc.', sector: 'Energy', basePrice: 0.90, volatility: 0.072, marketCap: '200M', emoji: '⛽' },
  { ticker: 'PLUG', name: 'Plug Power Inc.', sector: 'Energy', basePrice: 3.50, volatility: 0.058, marketCap: '2.1B', emoji: '🔌' },
  { ticker: 'FCEL', name: 'FuelCell Energy', sector: 'Energy', basePrice: 1.20, volatility: 0.065, marketCap: '500M', emoji: '⚡' },
  { ticker: 'BE', name: 'Bloom Energy', sector: 'Energy', basePrice: 12.50, volatility: 0.048, marketCap: '2.8B', emoji: '🌸' },
  { ticker: 'RUN', name: 'Sunrun Inc.', sector: 'Energy', basePrice: 14.20, volatility: 0.052, marketCap: '3.1B', emoji: '☀️' },
  { ticker: 'ARRY', name: 'Array Technologies', sector: 'Energy', basePrice: 12.80, volatility: 0.048, marketCap: '1.9B', emoji: '☀️' },
  { ticker: 'CHPT', name: 'ChargePoint Holdings', sector: 'Energy', basePrice: 1.40, volatility: 0.068, marketCap: '600M', emoji: '🔌' },
  { ticker: 'BLNK', name: 'Blink Charging', sector: 'Energy', basePrice: 2.50, volatility: 0.062, marketCap: '200M', emoji: '⚡' },
  { ticker: 'STEM', name: 'Stem, Inc.', sector: 'Energy', basePrice: 0.80, volatility: 0.078, marketCap: '120M', emoji: '🔋' },

  // ─── MICRO CAP (< $300M) ─────────────────────────
  { ticker: 'MULN', name: 'Mullen Automotive', sector: 'Consumer', basePrice: 0.08, volatility: 0.120, marketCap: '50M', emoji: '🚗' },
  { ticker: 'FFIE', name: 'Faraday Future', sector: 'Consumer', basePrice: 0.05, volatility: 0.130, marketCap: '30M', emoji: '🚗' },
  { ticker: 'SIRI', name: 'Sirius XM Holdings', sector: 'Communication', basePrice: 2.80, volatility: 0.042, marketCap: '8B', emoji: '📻' },
  { ticker: 'TELL', name: 'Tellurian Inc.', sector: 'Energy', basePrice: 0.60, volatility: 0.075, marketCap: '200M', emoji: '⛽' },
  { ticker: 'BIOR', name: 'Biora Therapeutics', sector: 'Healthcare', basePrice: 0.35, volatility: 0.095, marketCap: '30M', emoji: '💊' },
  { ticker: 'PRPH', name: 'ProPhase Labs', sector: 'Healthcare', basePrice: 1.50, volatility: 0.068, marketCap: '40M', emoji: '🧪' },
  { ticker: 'HPNN', name: 'Hop-On Inc.', sector: 'Technology', basePrice: 0.003, volatility: 0.150, marketCap: '5M', emoji: '📱' },
  { ticker: 'ATER', name: 'Aterian Inc.', sector: 'Consumer', basePrice: 0.45, volatility: 0.085, marketCap: '25M', emoji: '🏠' },
  { ticker: 'BBIG', name: 'Vinco Ventures', sector: 'Technology', basePrice: 0.15, volatility: 0.110, marketCap: '20M', emoji: '📹' },
  { ticker: 'CEI', name: 'Camber Energy', sector: 'Energy', basePrice: 0.08, volatility: 0.120, marketCap: '15M', emoji: '🛢️' },
  { ticker: 'PROG', name: 'Progenity Inc.', sector: 'Healthcare', basePrice: 0.20, volatility: 0.098, marketCap: '30M', emoji: '🧬' },
  { ticker: 'TRVN', name: 'Trevena Inc.', sector: 'Healthcare', basePrice: 0.15, volatility: 0.100, marketCap: '20M', emoji: '💊' },
  { ticker: 'GSAT', name: 'Globalstar Inc.', sector: 'Communication', basePrice: 1.80, volatility: 0.062, marketCap: '3.3B', emoji: '🌍' },
  { ticker: 'TTOO', name: 'T2 Biosystems', sector: 'Healthcare', basePrice: 0.10, volatility: 0.110, marketCap: '10M', emoji: '🧪' },
  { ticker: 'SOUN', name: 'SoundHound AI', sector: 'Technology', basePrice: 5.50, volatility: 0.072, marketCap: '1.8B', emoji: '🎤' },
  { ticker: 'BKKT', name: 'Bakkt Holdings', sector: 'Finance', basePrice: 1.20, volatility: 0.078, marketCap: '300M', emoji: '🪙' },
  { ticker: 'AFRM', name: 'Affirm Holdings', sector: 'Finance', basePrice: 35.20, volatility: 0.055, marketCap: '10B', emoji: '💳' },
  { ticker: 'UPST', name: 'Upstart Holdings', sector: 'Finance', basePrice: 28.50, volatility: 0.062, marketCap: '2.4B', emoji: '📊' },
  { ticker: 'LMND', name: 'Lemonade Inc.', sector: 'Finance', basePrice: 15.20, volatility: 0.058, marketCap: '1.1B', emoji: '🍋' },
  { ticker: 'PSFE', name: 'Paysafe Limited', sector: 'Finance', basePrice: 12.50, volatility: 0.048, marketCap: '800M', emoji: '💳' },

  // ─── MEME STOCKS ─────────────────────────────────
  { ticker: 'GME', name: 'GameStop Corp.', sector: 'Consumer', basePrice: 22.50, volatility: 0.065, marketCap: '9.6B', emoji: '🎮' },
  { ticker: 'AMC', name: 'AMC Entertainment', sector: 'Consumer', basePrice: 4.20, volatility: 0.068, marketCap: '2B', emoji: '🍿' },
  { ticker: 'BBBY', name: 'Bed Bath & Beyond', sector: 'Consumer', basePrice: 0.08, volatility: 0.150, marketCap: '10M', emoji: '🛁' },
  { ticker: 'KOSS', name: 'Koss Corporation', sector: 'Consumer', basePrice: 4.80, volatility: 0.072, marketCap: '45M', emoji: '🎧' },
  { ticker: 'EXPR', name: 'Express Inc.', sector: 'Consumer', basePrice: 1.20, volatility: 0.065, marketCap: '90M', emoji: '👕' },
  { ticker: 'NAKD', name: 'Centurion Corp.', sector: 'Consumer', basePrice: 0.30, volatility: 0.095, marketCap: '50M', emoji: '👙' },
  { ticker: 'CENN', name: 'Cenntro Electric', sector: 'Industrial', basePrice: 0.15, volatility: 0.110, marketCap: '25M', emoji: '🚛' },
  { ticker: 'IVR', name: 'Invesco Mortgage', sector: 'Real Estate', basePrice: 8.50, volatility: 0.038, marketCap: '500M', emoji: '🏘️' },
  { ticker: 'DWAC', name: 'Digital World Acquisition', sector: 'Technology', basePrice: 18.50, volatility: 0.078, marketCap: '3.8B', emoji: '📱' },
  { ticker: 'PHUN', name: 'Phunware Inc.', sector: 'Technology', basePrice: 0.60, volatility: 0.095, marketCap: '60M', emoji: '📲' },

  // ─── MORE SMALL CAPS ─────────────────────────────
  { ticker: 'BGFV', name: 'Big 5 Sporting Goods', sector: 'Consumer', basePrice: 5.50, volatility: 0.048, marketCap: '120M', emoji: '⚾' },
  { ticker: 'CATO', name: 'The Cato Corporation', sector: 'Consumer', basePrice: 7.20, volatility: 0.038, marketCap: '150M', emoji: '👗' },
  { ticker: 'DLTH', name: 'Duluth Trading', sector: 'Consumer', basePrice: 4.80, volatility: 0.045, marketCap: '155M', emoji: '🪵' },
  { ticker: 'FLWS', name: '1-800-Flowers.com', sector: 'Consumer', basePrice: 6.80, volatility: 0.042, marketCap: '440M', emoji: '💐' },
  { ticker: 'CTRN', name: 'Citi Trends Inc.', sector: 'Consumer', basePrice: 20.50, volatility: 0.048, marketCap: '160M', emoji: '👕' },
  { ticker: 'PRTY', name: 'Party City', sector: 'Consumer', basePrice: 0.05, volatility: 0.130, marketCap: '8M', emoji: '🎉' },
  { ticker: 'ZYNE', name: 'Zynerba Pharmaceuticals', sector: 'Healthcare', basePrice: 1.80, volatility: 0.075, marketCap: '60M', emoji: '💊' },
  { ticker: 'EDTX', name: 'EdtechX Holdings', sector: 'Technology', basePrice: 2.50, volatility: 0.068, marketCap: '40M', emoji: '📚' },
  { ticker: 'BNOX', name: 'Bionomics Ltd.', sector: 'Healthcare', basePrice: 3.20, volatility: 0.072, marketCap: '80M', emoji: '🧪' },
  { ticker: 'HYMC', name: 'Hycroft Mining', sector: 'Materials', basePrice: 2.80, volatility: 0.078, marketCap: '200M', emoji: '⛏️' },
  { ticker: 'SOS', name: 'SOS Limited', sector: 'Technology', basePrice: 4.50, volatility: 0.082, marketCap: '150M', emoji: '🆘' },
  { ticker: 'MDIA', name: 'MediaCo Holding', sector: 'Communication', basePrice: 0.80, volatility: 0.088, marketCap: '20M', emoji: '📺' },
  { ticker: 'AEHR', name: 'Aehr Test Systems', sector: 'Technology', basePrice: 14.50, volatility: 0.058, marketCap: '430M', emoji: '🔬' },
  { ticker: 'SOXS', name: 'SemiConductor Bear ETF', sector: 'Technology', basePrice: 8.20, volatility: 0.065, marketCap: '500M', emoji: '🐻' },
  { ticker: 'TQQQ', name: '3x NASDAQ Bull ETF', sector: 'Technology', basePrice: 55.50, volatility: 0.058, marketCap: '20B', emoji: '🐂' },
  { ticker: 'UVXY', name: 'ProShares VIX Short-Term', sector: 'Finance', basePrice: 22.50, volatility: 0.065, marketCap: '500M', emoji: '📉' },
  { ticker: 'ENVX', name: 'Enovix Corporation', sector: 'Technology', basePrice: 8.50, volatility: 0.062, marketCap: '1.4B', emoji: '🔋' },
  { ticker: 'BIOR', name: 'Biora Therapeutics', sector: 'Healthcare', basePrice: 0.30, volatility: 0.095, marketCap: '30M', emoji: '🧫' },
  { ticker: 'CNTB', name: 'Connect Biopharma', sector: 'Healthcare', basePrice: 1.20, volatility: 0.078, marketCap: '50M', emoji: '💉' },
  { ticker: 'APRE', name: 'Aprea Therapeutics', sector: 'Healthcare', basePrice: 2.80, volatility: 0.072, marketCap: '40M', emoji: '💊' },

  // ─── SPACs & HIGH RISK ────────────────────────────
  { ticker: 'PSNY', name: 'Polestar Automotive', sector: 'Consumer', basePrice: 1.80, volatility: 0.068, marketCap: '3.8B', emoji: '🚗' },
  { ticker: 'LCID', name: 'Lucid Group', sector: 'Consumer', basePrice: 4.50, volatility: 0.060, marketCap: '7B', emoji: '🚗' },
  { ticker: 'RIVN', name: 'Rivian Automotive', sector: 'Consumer', basePrice: 17.50, volatility: 0.058, marketCap: '11B', emoji: '🛻' },
  { ticker: 'NIO', name: 'NIO Inc.', sector: 'Consumer', basePrice: 5.20, volatility: 0.055, marketCap: '11B', emoji: '🚗' },
  { ticker: 'XPEV', name: 'XPeng Inc.', sector: 'Consumer', basePrice: 8.50, volatility: 0.058, marketCap: '8B', emoji: '🚗' },
  { ticker: 'LI', name: 'Li Auto Inc.', sector: 'Consumer', basePrice: 28.50, volatility: 0.048, marketCap: '30B', emoji: '🚗' },
  { ticker: 'VFS', name: 'VinFast Auto', sector: 'Consumer', basePrice: 4.20, volatility: 0.075, marketCap: '10B', emoji: '🚗' },
  { ticker: 'RIDE', name: 'Lordstown Motors', sector: 'Consumer', basePrice: 0.01, volatility: 0.120, marketCap: '25M', emoji: '🛻' },
  { ticker: 'FSR', name: 'Fisker Inc.', sector: 'Consumer', basePrice: 0.01, volatility: 0.130, marketCap: '15M', emoji: '🚗' },
  { ticker: 'EVGO', name: 'EVgo Inc.', sector: 'Energy', basePrice: 2.50, volatility: 0.062, marketCap: '700M', emoji: '🔌' },
];

export const CRYPTO = [
  // ─── MAJOR CRYPTO ──────────────────────────────────
  { ticker: 'BTC', name: 'Bitcoin', sector: 'Crypto', basePrice: 64800.00, volatility: 0.040, marketCap: '1.3T', emoji: '🪙' },
  { ticker: 'ETH', name: 'Ethereum', sector: 'Crypto', basePrice: 1865.00, volatility: 0.045, marketCap: '410B', emoji: '💎' },
  { ticker: 'SOL', name: 'Solana', sector: 'Crypto', basePrice: 77.50, volatility: 0.058, marketCap: '66B', emoji: '☀️' },
  { ticker: 'XRP', name: 'XRP', sector: 'Crypto', basePrice: 0.48, volatility: 0.042, marketCap: '27B', emoji: '💧' },
  { ticker: 'ADA', name: 'Cardano', sector: 'Crypto', basePrice: 0.38, volatility: 0.048, marketCap: '13B', emoji: '🔵' },
  { ticker: 'AVAX', name: 'Avalanche', sector: 'Crypto', basePrice: 28.50, volatility: 0.060, marketCap: '11B', emoji: '🔺' },
  { ticker: 'LINK', name: 'Chainlink', sector: 'Crypto', basePrice: 13.80, volatility: 0.052, marketCap: '8B', emoji: '🔗' },
  { ticker: 'DOT', name: 'Polkadot', sector: 'Crypto', basePrice: 5.80, volatility: 0.050, marketCap: '8B', emoji: '🔴' },
  { ticker: 'UNI', name: 'Uniswap', sector: 'Crypto', basePrice: 7.20, volatility: 0.056, marketCap: '4B', emoji: '🦄' },
  { ticker: 'NEAR', name: 'NEAR Protocol', sector: 'Crypto', basePrice: 4.80, volatility: 0.062, marketCap: '5.2B', emoji: '🌌' },
  { ticker: 'SUI', name: 'Sui', sector: 'Crypto', basePrice: 0.85, volatility: 0.068, marketCap: '2.2B', emoji: '💧' },

  // ─── MEME COINS ────────────────────────────────────
  { ticker: 'DOGE', name: 'Dogecoin', sector: 'Crypto', basePrice: 0.10, volatility: 0.065, marketCap: '18B', emoji: '🐕' },
  { ticker: 'SHIB', name: 'Shiba Inu', sector: 'Crypto', basePrice: 0.000015, volatility: 0.078, marketCap: '4.8B', emoji: '🐕‍🦺' },
  { ticker: 'PEPE', name: 'Pepe', sector: 'Crypto', basePrice: 0.0000095, volatility: 0.095, marketCap: '5.1B', emoji: '🐸' },
  { ticker: 'WIF', name: 'dogwifhat', sector: 'Crypto', basePrice: 1.72, volatility: 0.098, marketCap: '2.1B', emoji: '🎩' },
  { ticker: 'BONK', name: 'Bonk', sector: 'Crypto', basePrice: 0.000022, volatility: 0.095, marketCap: '1.6B', emoji: '🐶' },
  { ticker: 'FLOKI', name: 'Floki Inu', sector: 'Crypto', basePrice: 0.000135, volatility: 0.088, marketCap: '1.4B', emoji: '⚔️' },
  { ticker: 'MEME', name: 'Memecoin', sector: 'Crypto', basePrice: 0.018, volatility: 0.092, marketCap: '500M', emoji: '🎭' },
  { ticker: 'ELON', name: 'Dogelon Mars', sector: 'Crypto', basePrice: 0.0000002, volatility: 0.110, marketCap: '120M', emoji: '🚀' },
  { ticker: 'BABYDOGE', name: 'Baby Doge Coin', sector: 'Crypto', basePrice: 0.000000002, volatility: 0.120, marketCap: '300M', emoji: '🍼' },
  { ticker: 'KISHU', name: 'Kishu Inu', sector: 'Crypto', basePrice: 0.0000000008, volatility: 0.130, marketCap: '80M', emoji: '🐕' },
  { ticker: 'SAMO', name: 'Samoyedcoin', sector: 'Crypto', basePrice: 0.005, volatility: 0.098, marketCap: '25M', emoji: '🐕' },
  { ticker: 'MYRO', name: 'Myro', sector: 'Crypto', basePrice: 0.08, volatility: 0.100, marketCap: '80M', emoji: '🐕' },
  { ticker: 'POPCAT', name: 'Popcat', sector: 'Crypto', basePrice: 0.35, volatility: 0.105, marketCap: '340M', emoji: '🐱' },
  { ticker: 'MEW', name: 'cat in a dogs world', sector: 'Crypto', basePrice: 0.003, volatility: 0.108, marketCap: '280M', emoji: '🐱' },
  { ticker: 'BRETT', name: 'Brett', sector: 'Crypto', basePrice: 0.08, volatility: 0.100, marketCap: '800M', emoji: '🧔' },
  { ticker: 'BOME', name: 'Book of Meme', sector: 'Crypto', basePrice: 0.008, volatility: 0.098, marketCap: '550M', emoji: '📖' },
  { ticker: 'SLERF', name: 'Slerf', sector: 'Crypto', basePrice: 0.15, volatility: 0.115, marketCap: '70M', emoji: '🦥' },
  { ticker: 'TREMP', name: 'Doland Tremp', sector: 'Crypto', basePrice: 0.25, volatility: 0.120, marketCap: '50M', emoji: '🇺🇸' },
  { ticker: 'MOTHER', name: 'Mother Iggy', sector: 'Crypto', basePrice: 0.05, volatility: 0.110, marketCap: '50M', emoji: '👩' },
  { ticker: 'GME_COIN', name: 'GME (Solana)', sector: 'Crypto', basePrice: 0.002, volatility: 0.130, marketCap: '20M', emoji: '🎮' },
  { ticker: 'TRUMP', name: 'MAGA', sector: 'Crypto', basePrice: 3.50, volatility: 0.105, marketCap: '330M', emoji: '🧢' },
  { ticker: 'TURBO', name: 'Turbo', sector: 'Crypto', basePrice: 0.005, volatility: 0.100, marketCap: '350M', emoji: '🐸' },
  { ticker: 'LADYS', name: 'Milady Meme Coin', sector: 'Crypto', basePrice: 0.0000001, volatility: 0.115, marketCap: '95M', emoji: '👧' },
  { ticker: 'COQ', name: 'Coq Inu', sector: 'Crypto', basePrice: 0.000003, volatility: 0.108, marketCap: '35M', emoji: '🐔' },
  { ticker: 'MOG', name: 'Mog Coin', sector: 'Crypto', basePrice: 0.0000015, volatility: 0.105, marketCap: '600M', emoji: '😎' },
];

// Remove duplicate tickers
const seenTickers = new Set();
const STOCKS_UNIQUE = STOCKS.filter(item => {
  if (seenTickers.has(item.ticker)) return false;
  seenTickers.add(item.ticker);
  return true;
});

export { STOCKS_UNIQUE };

export function getAllAssets() {
  return [...STOCKS_UNIQUE, ...CRYPTO];
}

export function getAssetByTicker(ticker) {
  return getAllAssets().find(a => a.ticker === ticker) || null;
}

export function getStockSectors() {
  return [...new Set(STOCKS_UNIQUE.map(s => s.sector))];
}
