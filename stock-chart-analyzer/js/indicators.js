// ─── Mathematical Calculations of Technical Indicators ─────────────────────────

// 1. Simple Moving Average (SMA)
export function calculateSMA(data, period) {
  const sma = new Array(data.length).fill(null);
  if (data.length < period) return sma;

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  sma[period - 1] = sum / period;

  for (let i = period; i < data.length; i++) {
    sum = sum - data[i - period].close + data[i].close;
    sma[i] = sum / period;
  }
  return sma;
}

// 2. Exponential Moving Average (EMA)
export function calculateEMA(data, period) {
  const ema = new Array(data.length).fill(null);
  if (data.length < period) return ema;

  // Start with SMA for the first value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let prevEma = sum / period;
  ema[period - 1] = prevEma;

  const k = 2 / (period + 1);
  for (let i = period; i < data.length; i++) {
    const currentEma = data[i].close * k + prevEma * (1 - k);
    ema[i] = currentEma;
    prevEma = currentEma;
  }
  return ema;
}

// 3. Bollinger Bands (20 period, 2 Standard Deviations)
export function calculateBollingerBands(data, period = 20, multiplier = 2) {
  const upper = new Array(data.length).fill(null);
  const middle = new Array(data.length).fill(null);
  const lower = new Array(data.length).fill(null);

  if (data.length < period) return { upper, middle, lower };

  // Middle band is SMA 20
  const sma = calculateSMA(data, period);

  for (let i = period - 1; i < data.length; i++) {
    middle[i] = sma[i];
    
    // Calculate Standard Deviation
    let sumSqDiff = 0;
    const mean = sma[i];
    for (let j = i - period + 1; j <= i; j++) {
      const diff = data[j].close - mean;
      sumSqDiff += diff * diff;
    }
    const stdDev = Math.sqrt(sumSqDiff / period);
    
    upper[i] = mean + multiplier * stdDev;
    lower[i] = mean - multiplier * stdDev;
  }

  return { upper, middle, lower };
}

// 4. Relative Strength Index (RSI, 14 period, Wilders Smoothing)
export function calculateRSI(data, period = 14) {
  const rsi = new Array(data.length).fill(null);
  if (data.length <= period) return rsi;

  let avgGain = 0;
  let avgLoss = 0;

  // Calculate first RSI using simple average
  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff > 0) {
      avgGain += diff;
    } else {
      avgLoss += -diff;
    }
  }

  avgGain /= period;
  avgLoss /= period;

  if (avgLoss === 0) {
    rsi[period] = 100;
  } else {
    const rs = avgGain / avgLoss;
    rsi[period] = 100 - (100 / (1 + rs));
  }

  // Calculate remaining values using Wilders smoothing
  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = 100 - (100 / (1 + rs));
    }
  }

  return rsi;
}

// 5. MACD (12, 26, 9)
export function calculateMACD(data, shortPeriod = 12, longPeriod = 26, signalPeriod = 9) {
  const macdLine = new Array(data.length).fill(null);
  const signalLine = new Array(data.length).fill(null);
  const histogram = new Array(data.length).fill(null);

  if (data.length < longPeriod) return { macdLine, signalLine, histogram };

  const shortEma = calculateEMA(data, shortPeriod);
  const longEma = calculateEMA(data, longPeriod);

  for (let i = longPeriod - 1; i < data.length; i++) {
    macdLine[i] = shortEma[i] - longEma[i];
  }

  // Calculate Signal Line (EMA of MACD Line)
  // We extract non-null MACD values to calculate EMA
  const macdDataForEma = macdLine.map((val) => ({ close: val || 0 }));
  const macdEma = calculateEMA(macdDataForEma.slice(longPeriod - 1), signalPeriod);

  for (let i = longPeriod - 1 + signalPeriod - 1; i < data.length; i++) {
    const emaIndex = i - (longPeriod - 1);
    signalLine[i] = macdEma[emaIndex];
    histogram[i] = macdLine[i] - signalLine[i];
  }

  return { macdLine, signalLine, histogram };
}
