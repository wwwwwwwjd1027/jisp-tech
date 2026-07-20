// ─── AI Tech Pattern Recognition & Predictive Analysis Engine ─────────────────────
import { calculateRSI, calculateMACD, calculateBollingerBands, calculateEMA } from './indicators.js';

// 1. Support and Resistance Level Finder
// Scans for local extrema (pivot highs/lows) and aggregates them to find significant levels
export function findSupportResistance(data, range = 5) {
  const supports = [];
  const resistances = [];

  for (let i = range; i < data.length - range; i++) {
    const current = data[i];
    
    // Check local minimum (Support candidate)
    let isMin = true;
    for (let j = i - range; j <= i + range; j++) {
      if (data[j].low < current.low) {
        isMin = false;
        break;
      }
    }
    if (isMin) {
      supports.push(current.low);
    }

    // Check local maximum (Resistance candidate)
    let isMax = true;
    for (let j = i - range; j <= i + range; j++) {
      if (data[j].high > current.high) {
        isMax = false;
        break;
      }
    }
    if (isMax) {
      resistances.push(current.high);
    }
  }

  // Cluster levels that are very close (within 1% range) to find strong ones
  const cluster = (levels) => {
    if (levels.length === 0) return [];
    levels.sort((a, b) => a - b);
    const result = [];
    let currentCluster = [levels[0]];
    
    for (let i = 1; i < levels.length; i++) {
      const last = currentCluster[currentCluster.length - 1];
      if ((levels[i] - last) / last < 0.015) {
        currentCluster.push(levels[i]);
      } else {
        const avg = currentCluster.reduce((sum, v) => sum + v, 0) / currentCluster.length;
        result.push(avg);
        currentCluster = [levels[i]];
      }
    }
    const avg = currentCluster.reduce((sum, v) => sum + v, 0) / currentCluster.length;
    result.push(avg);
    return result;
  };

  return {
    supports: cluster(supports).slice(-4), // keep the closest recent levels
    resistances: cluster(resistances).slice(-4)
  };
}

// 2. Multi-factor AI Analyst Score (0-100 scale)
// Outputs score + text summary of technical posture
export function analyzeTechnicalScore(data) {
  if (data.length < 10) {
    return { score: 50, trend: 'neutral', status: 'INSUFFICIENT DATA', factors: [] };
  }

  const latestIndex = data.length - 1;
  const currentPrice = data[latestIndex].close;
  
  // ── Indicators
  const rsi = calculateRSI(data);
  const macd = calculateMACD(data);
  const bb = calculateBollingerBands(data);
  const ema20 = calculateEMA(data, 20);

  const currentRsi = rsi[latestIndex];
  const currentMacd = macd.macdLine[latestIndex];
  const currentSignal = macd.signalLine[latestIndex];
  const prevMacd = macd.macdLine[latestIndex - 1];
  const prevSignal = macd.signalLine[latestIndex - 1];
  const currentEma20 = ema20[latestIndex];
  const currentBbUpper = bb.upper[latestIndex];
  const currentBbLower = bb.lower[latestIndex];

  let score = 50; // starts neutral
  const factors = [];

  // Factor 1: Trend (Price relative to EMA 20)
  if (currentEma20 !== null && !isNaN(currentEma20)) {
    if (currentPrice > currentEma20) {
      const percentAbove = ((currentPrice - currentEma20) / currentEma20) * 100;
      if (percentAbove > 2) {
        score += 15;
        factors.push({ name: 'Trend (EMA 20)', score: '+15', desc: 'Bullish (Strongly above EMA 20)' });
      } else {
        score += 8;
        factors.push({ name: 'Trend (EMA 20)', score: '+8', desc: 'Bullish (Slightly above EMA 20)' });
      }
    } else {
      const percentBelow = ((currentEma20 - currentPrice) / currentEma20) * 100;
      if (percentBelow > 2) {
        score -= 15;
        factors.push({ name: 'Trend (EMA 20)', score: '-15', desc: 'Bearish (Strongly below EMA 20)' });
      } else {
        score -= 8;
        factors.push({ name: 'Trend (EMA 20)', score: '-8', desc: 'Bearish (Slightly below EMA 20)' });
      }
    }
  } else {
    factors.push({ name: 'Trend (EMA 20)', score: '0', desc: 'Neutral (EMA 20 not established)' });
  }

  // Factor 2: RSI Momentum
  if (currentRsi !== null) {
    if (currentRsi > 70) {
      score -= 10; // Overbought, risk of pullback
      factors.push({ name: 'RSI Momentum', score: '-10', desc: `Overbought (${currentRsi.toFixed(1)} > 70) - Risk of correction` });
    } else if (currentRsi < 30) {
      score += 15; // Oversold, potential bounce
      factors.push({ name: 'RSI Momentum', score: '+15', desc: `Oversold (${currentRsi.toFixed(1)} < 30) - High rebound probability` });
    } else {
      // Neutral but positive trend if RSI is rising
      const prevRsi = rsi[latestIndex - 1];
      if (currentRsi > prevRsi) {
        score += 5;
        factors.push({ name: 'RSI Momentum', score: '+5', desc: `Neutral-Rising (${currentRsi.toFixed(1)})` });
      } else {
        score -= 2;
        factors.push({ name: 'RSI Momentum', score: '-2', desc: `Neutral-Falling (${currentRsi.toFixed(1)})` });
      }
    }
  }

  // Factor 3: MACD Crossovers
  if (currentMacd !== null && currentSignal !== null && prevMacd !== null && prevSignal !== null) {
    const crossover = currentMacd - currentSignal;
    const prevCrossover = prevMacd - prevSignal;
    
    if (crossover > 0 && prevCrossover <= 0) {
      score += 15; // Golden Cross
      factors.push({ name: 'MACD', score: '+15', desc: 'Golden Cross (Bullish breakout signal)' });
    } else if (crossover < 0 && prevCrossover >= 0) {
      score -= 15; // Death Cross
      factors.push({ name: 'MACD', score: '-15', desc: 'Death Cross (Bearish breakdown signal)' });
    } else if (crossover > 0) {
      score += 5;
      factors.push({ name: 'MACD', score: '+5', desc: 'MACD bullish divergence' });
    } else {
      score -= 5;
      factors.push({ name: 'MACD', score: '-5', desc: 'MACD bearish divergence' });
    }
  }

  // Factor 4: Bollinger Band Volatility
  if (currentBbUpper && currentBbLower) {
    const totalBandWidth = currentBbUpper - currentBbLower;
    const positionInBand = (currentPrice - currentBbLower) / totalBandWidth;
    
    if (positionInBand > 0.95) {
      score -= 8; // Bollinger Upper Band resistance
      factors.push({ name: 'Bollinger Bands', score: '-8', desc: 'Price at upper band boundary (Potential resistance)' });
    } else if (positionInBand < 0.05) {
      score += 10; // Bollinger Lower Band support
      factors.push({ name: 'Bollinger Bands', score: '+10', desc: 'Price at lower band boundary (Potential support)' });
    } else {
      factors.push({ name: 'Bollinger Bands', score: '0', desc: 'Neutral (Price within band boundaries)' });
    }
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine overall status
  let status = 'NEUTRAL';
  let trend = 'neutral';
  if (score >= 70) {
    status = 'STRONG BUY';
    trend = 'bullish';
  } else if (score >= 55) {
    status = 'BUY';
    trend = 'bullish';
  } else if (score <= 30) {
    status = 'STRONG SELL';
    trend = 'bearish';
  } else if (score <= 45) {
    status = 'SELL';
    trend = 'bearish';
  }

  return { score, status, trend, factors };
}

// 3. Simulated Predictive Corridor (Future 20 Ticks / Days)
// Calculates volatility and extrapolates the price trend with statistical variance bands
export function predictFutureCorridor(data, forecastDays = 20) {
  if (data.length < 10) return [];
  
  // Calculate historical returns volatility
  let sumReturns = 0;
  const returns = [];
  for (let i = 1; i < data.length; i++) {
    const ret = (data[i].close - data[i - 1].close) / data[i - 1].close;
    returns.push(ret);
    sumReturns += ret;
  }
  const meanReturn = sumReturns / returns.length;
  
  let sumSqDiff = 0;
  for (const r of returns) {
    sumSqDiff += (r - meanReturn) * (r - meanReturn);
  }
  const dailyVol = Math.sqrt(sumSqDiff / returns.length);
  
  // Extrapolate using last price
  const lastIndex = data.length - 1;
  const lastPrice = data[lastIndex].close;
  const lastDateStr = data[lastIndex].date;
  
  let lastDate = new Date(lastDateStr);
  let isIntraday = false;
  
  if (isNaN(lastDate.getTime()) || lastDateStr.includes(':')) {
    isIntraday = true;
    lastDate = new Date();
  }

  const predictions = [];
  let currentMiddle = lastPrice;
  
  // Factor in the AI scoring to slightly tilt the predicted middle path
  const analysis = analyzeTechnicalScore(data);
  const trendMultiplier = (analysis.score - 50) * 0.0003; // tilt slope up or down

  for (let d = 1; d <= forecastDays; d++) {
    let dateStr = '';
    
    if (isIntraday) {
      // Check if it's high frequency tick timeframe (contains seconds / 2 colons)
      const isTick = lastDateStr.split(':').length === 3;
      if (isTick) {
        lastDate.setSeconds(lastDate.getSeconds() + 1);
        dateStr = lastDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } else {
        lastDate.setMinutes(lastDate.getMinutes() + 15);
        dateStr = lastDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } else {
      // Generate dates (skipping weekends)
      lastDate.setDate(lastDate.getDate() + 1);
      while (lastDate.getDay() === 0 || lastDate.getDay() === 6) {
        lastDate.setDate(lastDate.getDate() + 1);
      }
      dateStr = lastDate.toISOString().split('T')[0];
    }
    
    // Extrapolate drift
    currentMiddle = currentMiddle * (1 + meanReturn + trendMultiplier);
    
    // Extrapolate variance (broadening tunnel)
    const varianceFactor = dailyVol * Math.sqrt(d) * 1.645; // 90% confidence corridor
    const upper = currentMiddle * (1 + varianceFactor);
    const lower = currentMiddle * (1 - varianceFactor);

    predictions.push({
      date: dateStr,
      middle: +currentMiddle.toFixed(2),
      upper: +upper.toFixed(2),
      lower: +lower.toFixed(2),
      isForecast: true
    });
  }

  return predictions;
}
