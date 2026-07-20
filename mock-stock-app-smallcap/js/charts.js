/**
 * charts.js – Canvas-based financial chart rendering module
 *
 * Renders candlestick charts with moving-average overlays, volume bars,
 * price/time axes, a latest-price line, crosshair with OHLCV tooltip,
 * and subtle grid lines.  Fully responsive and HiDPI-aware.
 *
 * @module charts
 */

// ──────────────────────────────────────────────
// Color palette (dark trading theme)
// ──────────────────────────────────────────────
const COLORS = {
  bg:             '#ffffff',
  grid:           '#f3f4f6',
  text:           '#6b7280',
  upBody:         '#10b981',
  downBody:       '#ef4444',
  upWick:         '#10b981',
  downWick:       '#ef4444',
  volUp:          'rgba(16, 185, 129, 0.15)',
  volDown:        'rgba(239, 68, 68, 0.15)',
  crosshair:      'rgba(0, 0, 0, 0.15)',
  crosshairLabel: '#1e2430',
  ma5:            '#3b82f6',
  ma20:           '#3b82f6',
  latestPrice:    'rgba(0,0,0,0.3)',
};

// Layout constants
const VOLUME_RATIO    = 0.20;   // bottom 20 % of the canvas
const AXIS_RIGHT_W    = 70;     // width reserved for the price axis
const AXIS_BOTTOM_H   = 28;     // height reserved for the time axis
const PADDING_TOP     = 16;     // top padding inside the chart area
const Y_PAD_FACTOR    = 0.05;   // 5 % vertical padding on auto-scale
const MIN_CANDLE_W    = 3;
const MAX_CANDLE_W    = 20;
const CANDLE_GAP      = 1.5;    // gap between candle centres
const WICK_WIDTH      = 1;

// ──────────────────────────────────────────────
// Utility helpers
// ──────────────────────────────────────────────

/**
 * Compute Simple Moving Average for an array of OHLCV objects.
 * Returns an array of the same length; entries before the window is
 * fully populated are `null`.
 */
function calcSMA(data, period) {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((sum, d) => sum + d.close, 0) / period;
  });
}

/**
 * Auto-detect a sensible number of decimal places based on the
 * magnitude of the price range shown on screen.
 */
function autoDecimals(range) {
  if (range >= 1000) return 0;
  if (range >= 10)   return 1;
  if (range >= 1)    return 2;
  if (range >= 0.01) return 4;
  if (range >= 0.0001) return 6;
  return 9;
}

/**
 * Format a price value with the given number of decimals.
 */
function formatPrice(value, decimals) {
  return value.toFixed(decimals);
}

/**
 * Format a UNIX-ms timestamp for the time axis.
 * Uses 'MM/DD' for daily-scale data, 'HH:MM' for intraday.
 */
function formatTime(timestamp, isIntraday) {
  const d = new Date(timestamp);
  if (isIntraday) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mo}/${dd}`;
}

/**
 * Decide whether a dataset looks "intraday" by checking whether
 * consecutive timestamps are less than ~6 hours apart on average.
 */
function detectIntraday(data) {
  if (data.length < 2) return false;
  const avgGap =
    (data[data.length - 1].time - data[0].time) / (data.length - 1);
  return avgGap < 6 * 3600 * 1000; // 6 h in ms
}

/**
 * Set a dashed line style for the 2-D context.
 */
function setDash(ctx, segments = [4, 3]) {
  ctx.setLineDash(segments);
}
function clearDash(ctx) {
  ctx.setLineDash([]);
}

// ──────────────────────────────────────────────
// Chart class
// ──────────────────────────────────────────────
export class Chart {
  /**
   * @param {HTMLCanvasElement} canvas – the <canvas> element to draw on
   * @param {object}           options – reserved for future extensions
   */
  constructor(canvas, options = {}) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.options = options;
    this.data    = [];

    // Pre-computed derived data (filled by setData)
    this._sma5   = [];
    this._sma20  = [];
    this._isIntraday = false;

    // Mouse state for the crosshair
    this._mouseX = -1;
    this._mouseY = -1;
    this._mouseInside = false;

    // Bind event handlers so they can be removed in destroy()
    this._onMouseMove  = this._handleMouseMove.bind(this);
    this._onMouseLeave = this._handleMouseLeave.bind(this);
    this._onResize     = this._handleResize.bind(this);

    this.canvas.addEventListener('mousemove',  this._onMouseMove);
    this.canvas.addEventListener('mouseleave', this._onMouseLeave);
    window.addEventListener('resize', this._onResize);

    // Initial sizing
    this._fitToContainer();
  }

  // ── public API ──────────────────────────────

  /**
   * Set (or replace) the chart data and recompute derived series.
   * @param {Array<{time:number, open:number, high:number, low:number, close:number, volume:number}>} data
   */
  setData(data) {
    this.data = Array.isArray(data) ? data : [];
    this._sma5  = calcSMA(this.data, 5);
    this._sma20 = calcSMA(this.data, 20);
    this._isIntraday = detectIntraday(this.data);
    this.render();
  }

  /** Full re-render of the chart. */
  render() {
    this._fitToContainer();

    const { ctx, canvas } = this;
    const W = canvas.width;
    const H = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    // Clear
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    if (this.data.length === 0) {
      // Empty state
      ctx.fillStyle = COLORS.text;
      ctx.font = `${13 * dpr}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('No data', W / 2, H / 2);
      return;
    }

    // Compute layout (in device pixels)
    const layout = this._computeLayout(dpr);

    this._drawGrid(layout, dpr);
    this._drawVolume(layout, dpr);
    this._drawCandles(layout, dpr);
    this._drawMA(layout, dpr, this._sma5,  COLORS.ma5);
    this._drawMA(layout, dpr, this._sma20, COLORS.ma20);
    this._drawLatestPriceLine(layout, dpr);
    this._drawPriceAxis(layout, dpr);
    this._drawTimeAxis(layout, dpr);

    if (this._mouseInside) {
      this._drawCrosshair(layout, dpr);
    }
  }

  /** Tear down listeners and release resources. */
  destroy() {
    this.canvas.removeEventListener('mousemove',  this._onMouseMove);
    this.canvas.removeEventListener('mouseleave', this._onMouseLeave);
    window.removeEventListener('resize', this._onResize);
  }

  // ── event handlers ──────────────────────────

  _handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this._mouseX = e.clientX - rect.left;
    this._mouseY = e.clientY - rect.top;
    this._mouseInside = true;
    this.render();
  }

  _handleMouseLeave() {
    this._mouseInside = false;
    this.render();
  }

  _handleResize() {
    this.render();
  }

  // ── sizing ──────────────────────────────────

  /** Size the canvas to match its parent container, accounting for DPR. */
  _fitToContainer() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = parent.clientHeight;

    // Only touch the DOM when dimensions actually changed
    if (
      this.canvas.width  !== Math.round(w * dpr) ||
      this.canvas.height !== Math.round(h * dpr)
    ) {
      this.canvas.style.width  = `${w}px`;
      this.canvas.style.height = `${h}px`;
      this.canvas.width  = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
    }
  }

  // ── layout computation ──────────────────────

  /**
   * Compute all layout metrics needed by the drawing helpers.
   * All values are in device-pixel space.
   */
  _computeLayout(dpr) {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const data = this.data;

    // Regions
    const rightAxisW  = AXIS_RIGHT_W * dpr;
    const bottomAxisH = AXIS_BOTTOM_H * dpr;
    const topPad      = PADDING_TOP * dpr;

    const chartW = W - rightAxisW;
    const chartH = H - bottomAxisH;
    const volumeH = chartH * VOLUME_RATIO;
    const priceH  = chartH - volumeH - topPad;

    // Candle geometry
    const step = Math.max(MIN_CANDLE_W, Math.min(MAX_CANDLE_W,
      (chartW / data.length) - CANDLE_GAP));
    const totalStep = step + CANDLE_GAP;
    const startX = (chartW - totalStep * data.length) / 2 + totalStep / 2;

    // Price range (with padding)
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    for (const d of data) {
      if (d.low  < minPrice) minPrice = d.low;
      if (d.high > maxPrice) maxPrice = d.high;
    }
    // Handle single-point edge case
    if (minPrice === maxPrice) {
      minPrice -= 1;
      maxPrice += 1;
    }
    const priceRange = maxPrice - minPrice;
    const padded = priceRange * Y_PAD_FACTOR;
    minPrice -= padded;
    maxPrice += padded;

    // Volume range
    let maxVol = 0;
    for (const d of data) {
      if (d.volume > maxVol) maxVol = d.volume;
    }
    if (maxVol === 0) maxVol = 1; // avoid division by zero

    const decimals = autoDecimals(maxPrice - minPrice);

    return {
      W, H, dpr,
      chartW, chartH,
      rightAxisW, bottomAxisH, topPad,
      priceH, volumeH,
      step, totalStep, startX,
      minPrice, maxPrice, maxVol,
      decimals,
    };
  }

  // ── coordinate helpers ──────────────────────

  /** Map a price to a Y pixel (device space). */
  _priceToY(price, layout) {
    const { topPad, priceH, minPrice, maxPrice } = layout;
    return topPad + priceH * (1 - (price - minPrice) / (maxPrice - minPrice));
  }

  /** Map a Y pixel back to a price. */
  _yToPrice(y, layout) {
    const { topPad, priceH, minPrice, maxPrice } = layout;
    return minPrice + (1 - (y - topPad) / priceH) * (maxPrice - minPrice);
  }

  /** Map a data index to its centre-X pixel (device space). */
  _indexToX(i, layout) {
    return layout.startX + i * layout.totalStep;
  }

  /** Map an X pixel (CSS space) to the nearest data index. */
  _xToIndex(cssX, layout) {
    const devX = cssX * layout.dpr;
    const idx = Math.round((devX - layout.startX) / layout.totalStep);
    return Math.max(0, Math.min(this.data.length - 1, idx));
  }

  // ── drawing helpers ─────────────────────────

  /** Subtle grid lines spanning the chart area. */
  _drawGrid(layout, dpr) {
    const { ctx } = this;
    const { chartW, chartH, topPad, priceH, minPrice, maxPrice, decimals } = layout;

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    // Horizontal grid (price levels) – aim for ~5-7 lines
    const priceRange = maxPrice - minPrice;
    const rawStep = priceRange / 6;
    // Round to a "nice" number
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const niceStep = Math.ceil(rawStep / mag) * mag;

    let p = Math.ceil(minPrice / niceStep) * niceStep;
    while (p < maxPrice) {
      const y = this._priceToY(p, layout);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartW, y);
      ctx.stroke();
      p += niceStep;
    }

    // Vertical grid – every ~100 CSS-px
    const vStep = Math.max(1, Math.floor(100 * dpr / layout.totalStep));
    for (let i = 0; i < this.data.length; i += vStep) {
      const x = this._indexToX(i, layout);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, chartH);
      ctx.stroke();
    }
  }

  /** Volume bars across the bottom section. */
  _drawVolume(layout, dpr) {
    const { ctx, data } = this;
    const { chartH, volumeH, step } = layout;
    const volBottom = chartH;

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const isUp = d.close >= d.open;
      const barH = (d.volume / layout.maxVol) * volumeH;
      const x = this._indexToX(i, layout);

      ctx.fillStyle = isUp ? COLORS.volUp : COLORS.volDown;
      ctx.fillRect(
        x - step / 2,
        volBottom - barH,
        step,
        barH,
      );
    }
  }

  /** Candlestick bodies and wicks. */
  _drawCandles(layout, dpr) {
    const { ctx, data } = this;
    const { step } = layout;

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const x = this._indexToX(i, layout);
      const isUp = d.close >= d.open;

      // Wick
      const highY = this._priceToY(d.high, layout);
      const lowY  = this._priceToY(d.low,  layout);
      ctx.strokeStyle = isUp ? COLORS.upWick : COLORS.downWick;
      ctx.lineWidth = WICK_WIDTH * dpr;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      const openY  = this._priceToY(d.open,  layout);
      const closeY = this._priceToY(d.close, layout);
      const bodyTop = Math.min(openY, closeY);
      const bodyH   = Math.max(Math.abs(closeY - openY), 1 * dpr); // min 1 dev-px

      ctx.fillStyle = isUp ? COLORS.upBody : COLORS.downBody;
      ctx.fillRect(x - step / 2, bodyTop, step, bodyH);
    }
  }

  /** Draw a moving-average line. */
  _drawMA(layout, dpr, maValues, color) {
    const { ctx } = this;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5 * dpr;
    ctx.lineJoin = 'round';
    ctx.beginPath();

    let started = false;
    for (let i = 0; i < maValues.length; i++) {
      const v = maValues[i];
      if (v === null) continue;
      const x = this._indexToX(i, layout);
      const y = this._priceToY(v, layout);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  /** Horizontal dashed line at the latest close price. */
  _drawLatestPriceLine(layout, dpr) {
    const { ctx, data } = this;
    const lastClose = data[data.length - 1].close;
    const y = this._priceToY(lastClose, layout);

    ctx.strokeStyle = COLORS.latestPrice;
    ctx.lineWidth = 1 * dpr;
    setDash(ctx, [6 * dpr, 4 * dpr]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(layout.chartW, y);
    ctx.stroke();
    clearDash(ctx);
  }

  /** Price labels along the right edge. */
  _drawPriceAxis(layout, dpr) {
    const { ctx } = this;
    const { chartW, minPrice, maxPrice, decimals } = layout;

    ctx.fillStyle = COLORS.text;
    ctx.font = `${11 * dpr}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const priceRange = maxPrice - minPrice;
    const rawStep = priceRange / 6;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const niceStep = Math.ceil(rawStep / mag) * mag;

    let p = Math.ceil(minPrice / niceStep) * niceStep;
    while (p < maxPrice) {
      const y = this._priceToY(p, layout);
      ctx.fillText(formatPrice(p, decimals), chartW + 8 * dpr, y);
      p += niceStep;
    }
  }

  /** Date / time labels along the bottom edge. */
  _drawTimeAxis(layout, dpr) {
    const { ctx, data } = this;
    const { chartH } = layout;

    ctx.fillStyle = COLORS.text;
    ctx.font = `${11 * dpr}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Show a label roughly every 80 CSS-px
    const labelStep = Math.max(1, Math.floor(80 * dpr / layout.totalStep));

    for (let i = 0; i < data.length; i += labelStep) {
      const x = this._indexToX(i, layout);
      const label = formatTime(data[i].time, this._isIntraday);
      ctx.fillText(label, x, chartH + 6 * dpr);
    }
  }

  /** Crosshair + OHLCV tooltip following the mouse. */
  _drawCrosshair(layout, dpr) {
    const { ctx, data } = this;
    const mx = this._mouseX * dpr;
    const my = this._mouseY * dpr;

    // Dashed crosshair lines
    ctx.strokeStyle = COLORS.crosshair;
    ctx.lineWidth = 1 * dpr;
    setDash(ctx, [4 * dpr, 3 * dpr]);

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(mx, 0);
    ctx.lineTo(mx, layout.chartH);
    ctx.stroke();

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, my);
    ctx.lineTo(layout.chartW, my);
    ctx.stroke();
    clearDash(ctx);

    // Price label on the right axis
    const price = this._yToPrice(my, layout);
    const priceLabel = formatPrice(price, layout.decimals);
    const plWidth = ctx.measureText(priceLabel).width + 12 * dpr;
    const plHeight = 18 * dpr;

    ctx.fillStyle = COLORS.crosshairLabel;
    ctx.fillRect(layout.chartW, my - plHeight / 2, plWidth, plHeight);
    ctx.fillStyle = '#ffffff';
    ctx.font = `${11 * dpr}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(priceLabel, layout.chartW + 6 * dpr, my);

    // Time label on the bottom axis
    const idx = this._xToIndex(this._mouseX, layout);
    if (idx >= 0 && idx < data.length) {
      const d = data[idx];
      const timeLabel = formatTime(d.time, this._isIntraday);
      const tlWidth = ctx.measureText(timeLabel).width + 12 * dpr;
      const tlHeight = 18 * dpr;
      const tx = this._indexToX(idx, layout);

      ctx.fillStyle = COLORS.crosshairLabel;
      ctx.fillRect(tx - tlWidth / 2, layout.chartH, tlWidth, tlHeight);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(timeLabel, tx, layout.chartH + 3 * dpr);

      // OHLCV tooltip near the cursor
      this._drawTooltip(d, mx, my, layout, dpr);
    }
  }

  /** Render an OHLCV tooltip box near the given device-pixel position. */
  _drawTooltip(d, mx, my, layout, dpr) {
    const { ctx } = this;
    const lines = [
      `O: ${formatPrice(d.open,  layout.decimals)}`,
      `H: ${formatPrice(d.high,  layout.decimals)}`,
      `L: ${formatPrice(d.low,   layout.decimals)}`,
      `C: ${formatPrice(d.close, layout.decimals)}`,
      `V: ${d.volume.toLocaleString()}`,
    ];

    ctx.font = `${11 * dpr}px monospace`;
    const lineH = 16 * dpr;
    const pad   = 8 * dpr;

    // Measure the widest line
    let maxW = 0;
    for (const l of lines) {
      const w = ctx.measureText(l).width;
      if (w > maxW) maxW = w;
    }

    const boxW = maxW + pad * 2;
    const boxH = lines.length * lineH + pad * 2;

    // Position the tooltip so it doesn't overflow the canvas
    let tx = mx + 14 * dpr;
    let ty = my + 14 * dpr;
    if (tx + boxW > layout.W) tx = mx - boxW - 10 * dpr;
    if (ty + boxH > layout.H) ty = my - boxH - 10 * dpr;

    // Background
    ctx.fillStyle = COLORS.crosshairLabel;
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.roundRect(tx, ty, boxW, boxH, 4 * dpr);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Text
    const isUp = d.close >= d.open;
    ctx.fillStyle = isUp ? COLORS.upBody : COLORS.downBody;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], tx + pad, ty + pad + i * lineH);
    }
  }
}
