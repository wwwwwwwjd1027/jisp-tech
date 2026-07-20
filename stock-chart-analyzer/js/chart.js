// ─── Interactive HTML5 Canvas Technical Charting Engine ────────────────────────
import { calculateSMA, calculateEMA, calculateBollingerBands, calculateRSI, calculateMACD } from './indicators.js';

export class TechnicalChart {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = {
      theme: {
        bg: '#ffffff',
        grid: '#f3f4f6',
        text: '#6b7280',
        up: '#10b981',
        down: '#ef4444',
        ma: '#3b82f6',
        bb: 'rgba(59, 130, 246, 0.1)',
        crosshair: 'rgba(0, 0, 0, 0.15)',
        forecast: 'rgba(16, 185, 129, 0.05)',
      },
      ...options
    };

    this.data = [];
    this.forecastData = [];
    
    // Zoom and pan state
    this.zoomFactor = 1.0; 
    this.panOffset = 0; // translation in pixels
    this.candleWidth = 10;
    this.candleGap = 3;

    // Viewport and mouse state
    this.mouse = { x: -1, y: -1, isDown: false, lastX: 0, hoverIndex: -1 };
    
    // Indicators toggles
    this.activeIndicators = {
      sma: true,
      ema: true,
      bb: true,
      rsi: true,
      macd: true,
      sr: true,
      forecast: true
    };

    this._initEvents();
    this.resize();
  }

  setData(data, forecast = []) {
    this.data = data || [];
    this.forecastData = forecast || [];
    this.resetView();
  }

  setIndicator(name, active) {
    if (this.activeIndicators.hasOwnProperty(name)) {
      this.activeIndicators[name] = active;
      this.render();
    }
  }

  resetView() {
    this.zoomFactor = 1.0;
    this.panOffset = 0;
    const totalCount = this.data.length + (this.activeIndicators.forecast ? this.forecastData.length : 0);
    if (totalCount > 0) {
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = this.canvas.width / dpr;
      const usableWidth = cssWidth - 70; // right padding for price scale
      
      // Dynamically adjust gap if there are many candles to display
      this.candleGap = totalCount > 1000 ? 0 : (totalCount > 100 ? 1 : 2);
      
      // Fit candles to screen width (allow width to go down to 0.01 for maximum visibility)
      this.candleWidth = Math.max(0.01, Math.min(25, (usableWidth / totalCount) - this.candleGap));
      
      // If it still overflows due to min-width cap, shrink the gap even further
      const totalWidthNeeded = totalCount * (this.candleWidth + this.candleGap);
      if (totalWidthNeeded > usableWidth) {
        this.candleGap = 0;
        this.candleWidth = Math.max(0.01, (usableWidth / totalCount) - this.candleGap);
      }
    }
    this.render();
  }

  resize() {
    const parent = this.canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = parent.clientWidth * dpr;
    this.canvas.height = parent.clientHeight * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = parent.clientWidth + 'px';
    this.canvas.style.height = parent.clientHeight + 'px';
    this.render();
  }

  /* ── Events Handling ─────────────────────── */
  _initEvents() {
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('mousedown', (e) => {
      this.mouse.isDown = true;
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.lastX = e.clientX - rect.left;
    });

    this.canvas.addEventListener('mouseup', () => {
      this.mouse.isDown = false;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.isDown = false;
      this.mouse.x = -1;
      this.mouse.y = -1;
      this.mouse.hoverIndex = -1;
      this.render();
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.mouse.isDown) {
        const dx = x - this.mouse.lastX;
        this.panOffset += dx;
        this.mouse.lastX = x;
      }

      this.mouse.x = x;
      this.mouse.y = y;
      this.render();
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      const zoomIntensity = 0.08;
      const oldCandleSize = this.candleWidth;
      
      if (e.deltaY < 0) {
        this.candleWidth = Math.min(40, this.candleWidth * (1 + zoomIntensity));
      } else {
        this.candleWidth = Math.max(3, this.candleWidth * (1 - zoomIntensity));
      }

      // Adjust panOffset to zoom centered on mouse pointer
      const totalCandles = this.data.length + (this.activeIndicators.forecast ? this.forecastData.length : 0);
      const ratio = this.candleWidth / oldCandleSize;
      this.panOffset = mouseX - (mouseX - this.panOffset) * ratio;

      this.render();
    }, { passive: false });
  }

  /* ── Mathematical Indicator Pre-computations ── */
  _computeIndicators() {
    if (this.data.length === 0) return null;
    
    return {
      sma: calculateSMA(this.data, 20),
      ema: calculateEMA(this.data, 10),
      bb: calculateBollingerBands(this.data, 20),
      rsi: calculateRSI(this.data, 14),
      macd: calculateMACD(this.data, 12, 26, 9)
    };
  }

  /* ── Main Render Loop ────────────────────── */
  render() {
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    
    // Clear canvas
    this.ctx.fillStyle = this.options.theme.bg;
    this.ctx.fillRect(0, 0, w, h);

    if (this.isLoading) {
      this.ctx.fillStyle = this.options.theme.text;
      this.ctx.font = '14px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Loading Market Data...', w / 2, h / 2);
      return;
    }

    if (this.data.length === 0) {
      this.ctx.fillStyle = this.options.theme.text;
      this.ctx.font = '14px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('NO DATA LOADED. DROP A CSV FILE OR SELECT AN ASSET.', w / 2, h / 2);
      return;
    }

    // Panels heights splitting (Main, RSI, MACD dynamic based on active indicators)
    const margin = 20;
    const startY = 15;
    const paddingBottom = 25;
    const usableHeight = h - startY - paddingBottom;
    
    let mainRatio = 1.0;
    let subRatio = 0.0;
    let activeSubCount = 0;
    if (this.activeIndicators.rsi) activeSubCount++;
    if (this.activeIndicators.macd) activeSubCount++;

    if (activeSubCount === 2) {
      mainRatio = 0.60;
      subRatio = 0.16;
    } else if (activeSubCount === 1) {
      mainRatio = 0.76;
      subRatio = 0.20;
    }

    const priceArea = { x: 0, y: startY, w: w - 70, h: usableHeight * mainRatio };
    
    let currentY = priceArea.y + priceArea.h + margin;
    let rsiArea = null;
    if (this.activeIndicators.rsi) {
      rsiArea = { x: 0, y: currentY, w: priceArea.w, h: usableHeight * subRatio };
      currentY += rsiArea.h + margin;
    }

    let macdArea = null;
    if (this.activeIndicators.macd) {
      macdArea = { x: 0, y: currentY, w: priceArea.w, h: usableHeight * subRatio };
    }

    // Compute indicators
    const ind = this._computeIndicators();

    // Map drawing positions
    const candleStep = this.candleWidth + this.candleGap;
    const totalItems = this.data.length + (this.activeIndicators.forecast ? this.forecastData.length : 0);

    // Calculate which elements are visible
    // index in data maps to: X = index * candleStep + panOffset
    // We want to find min/max visible values in price area to scale Y axis appropriately
    let startIdx = Math.max(0, Math.floor(-this.panOffset / candleStep));
    let endIdx = Math.min(totalItems - 1, Math.ceil((priceArea.w - this.panOffset) / candleStep));

    if (startIdx > endIdx) {
      startIdx = 0;
      endIdx = totalItems - 1;
    }

    // Min Max inside visible window for Scaling Y
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    for (let i = startIdx; i <= endIdx; i++) {
      if (i < this.data.length) {
        const c = this.data[i];
        minPrice = Math.min(minPrice, c.low);
        maxPrice = Math.max(maxPrice, c.high);

        // Include Bollinger Bands indicators in scaling if visible
        if (this.activeIndicators.bb && ind && ind.bb.lower[i]) {
          minPrice = Math.min(minPrice, ind.bb.lower[i]);
          maxPrice = Math.max(maxPrice, ind.bb.upper[i]);
        }
      } else {
        // Include Forecast in scaling
        const fIdx = i - this.data.length;
        const f = this.forecastData[fIdx];
        if (f) {
          minPrice = Math.min(minPrice, f.lower);
          maxPrice = Math.max(maxPrice, f.upper);
        }
      }
    }

    // Fallback if data is empty or invalid
    if (minPrice === Infinity) minPrice = 0;
    if (maxPrice === -Infinity) maxPrice = 100;
    const padding = (maxPrice - minPrice) * 0.05 || 1;
    minPrice -= padding;
    maxPrice += padding;

    // Helper functions to scale values
    const getX = (idx) => idx * candleStep + this.panOffset;
    const getY = (price) => priceArea.y + priceArea.h - ((price - minPrice) / (maxPrice - minPrice)) * priceArea.h;

    // Draw Grid Lines (Price Area)
    this._drawGrid(priceArea, minPrice, maxPrice, getY);

    // 1. Draw Bollinger Bands Cloud
    if (this.activeIndicators.bb && ind && ind.bb.upper.length > 0) {
      this.ctx.fillStyle = this.options.theme.bb;
      this.ctx.beginPath();
      let first = true;
      for (let i = startIdx; i <= endIdx; i++) {
        if (i >= this.data.length) break;
        const up = ind.bb.upper[i];
        if (up === null) continue;
        const x = getX(i) + this.candleWidth / 2;
        const y = getY(up);
        if (first) { this.ctx.moveTo(x, y); first = false; }
        else this.ctx.lineTo(x, y);
      }
      for (let i = Math.min(endIdx, this.data.length - 1); i >= startIdx; i--) {
        const lo = ind.bb.lower[i];
        if (lo === null) continue;
        const x = getX(i) + this.candleWidth / 2;
        const y = getY(lo);
        this.ctx.lineTo(x, y);
      }
      this.ctx.fill();
    }

    // 2. Draw Forecast Tunnel
    if (this.activeIndicators.forecast && this.forecastData.length > 0 && endIdx >= this.data.length) {
      this.ctx.fillStyle = this.options.theme.forecast;
      this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([4, 4]);
      
      this.ctx.beginPath();
      let first = true;
      for (let i = Math.max(startIdx, this.data.length); i <= endIdx; i++) {
        const fIdx = i - this.data.length;
        const f = this.forecastData[fIdx];
        if (!f) continue;
        const x = getX(i) + this.candleWidth / 2;
        const y = getY(f.upper);
        if (first) { this.ctx.moveTo(x, y); first = false; }
        else this.ctx.lineTo(x, y);
      }
      for (let i = Math.min(endIdx, this.data.length + this.forecastData.length - 1); i >= Math.max(startIdx, this.data.length); i--) {
        const fIdx = i - this.data.length;
        const f = this.forecastData[fIdx];
        if (!f) continue;
        const x = getX(i) + this.candleWidth / 2;
        const y = getY(f.lower);
        this.ctx.lineTo(x, y);
      }
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.setLineDash([]); // Reset
    }

    // 3. Draw Candlesticks & Forecast Path
    for (let i = startIdx; i <= endIdx; i++) {
      const x = getX(i);
      
      if (i < this.data.length) {
        // Normal Candlesticks
        const c = this.data[i];
        const isUp = c.close >= c.open;
        const candleColor = isUp ? this.options.theme.up : this.options.theme.down;

        this.ctx.strokeStyle = candleColor;
        this.ctx.fillStyle = candleColor;
        this.ctx.lineWidth = 1.5;

        // Wick
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.candleWidth / 2, getY(c.high));
        this.ctx.lineTo(x + this.candleWidth / 2, getY(c.low));
        this.ctx.stroke();

        // Body
        let bodyTop = getY(Math.max(c.open, c.close));
        let bodyBottom = getY(Math.min(c.open, c.close));
        if (isNaN(bodyTop) || !isFinite(bodyTop)) bodyTop = 0;
        if (isNaN(bodyBottom) || !isFinite(bodyBottom)) bodyBottom = 0;
        if (bodyTop === bodyBottom) {
          bodyBottom += 0.5;
        }
        const bodyHeight = Math.max(1, bodyBottom - bodyTop);
        
        if (isUp) {
          // Hollow/cyan gradient fill for futuristic up candles
          const grad = this.ctx.createLinearGradient(x, bodyTop, x, bodyBottom);
          grad.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
          grad.addColorStop(1, 'rgba(6, 182, 212, 0.05)');
          this.ctx.fillStyle = grad;
          this.ctx.fillRect(x, bodyTop, this.candleWidth, bodyHeight);
          this.ctx.strokeRect(x, bodyTop, this.candleWidth, bodyHeight);
        } else {
          // Filled hot-pink for down candles
          const grad = this.ctx.createLinearGradient(x, bodyTop, x, bodyBottom);
          grad.addColorStop(0, 'rgba(236, 72, 153, 0.8)');
          grad.addColorStop(1, 'rgba(236, 72, 153, 0.4)');
          this.ctx.fillStyle = grad;
          this.ctx.fillRect(x, bodyTop, this.candleWidth, bodyHeight);
        }
      } else {
        // Forecast Candlesticks
        const fIdx = i - this.data.length;
        const f = this.forecastData[fIdx];
        if (f) {
          const xCenter = x + this.candleWidth / 2;
          this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
          this.ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
          this.ctx.lineWidth = 1;
          
          // Draw projected middle line connection
          if (fIdx > 0) {
            const prevX = getX(i - 1) + this.candleWidth / 2;
            const prevY = getY(this.forecastData[fIdx - 1]?.middle || f.middle);
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
            this.ctx.setLineDash([2, 2]);
            this.ctx.moveTo(prevX, prevY);
            this.ctx.lineTo(xCenter, getY(f.middle));
            this.ctx.stroke();
            this.ctx.setLineDash([]);
          }

          // Dot at projected price
          this.ctx.beginPath();
          this.ctx.fillStyle = this.options.theme.up;
          this.ctx.arc(xCenter, getY(f.middle), 2.5, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }

    // 4. Draw Overlays (SMA/EMA lines)
    if (ind) {
      if (this.activeIndicators.sma) this._drawLineIndicator(ind.sma, getX, getY, startIdx, endIdx, '#a855f7', 1.5);
      if (this.activeIndicators.ema) this._drawLineIndicator(ind.ema, getX, getY, startIdx, endIdx, this.options.theme.ma, 1.5);
      if (this.activeIndicators.bb) {
        this._drawLineIndicator(ind.bb.upper, getX, getY, startIdx, endIdx, 'rgba(168, 85, 247, 0.4)', 1, [3, 3]);
        this._drawLineIndicator(ind.bb.lower, getX, getY, startIdx, endIdx, 'rgba(168, 85, 247, 0.4)', 1, [3, 3]);
      }
    }

    // 5. Draw Support / Resistance lines on Chart (if active)
    if (this.activeIndicators.sr && this.options.sr) {
      const { supports, resistances } = this.options.sr;
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([6, 4]);

      this.ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)'; // Support: Green
      (supports || []).forEach(val => {
        this.ctx.beginPath();
        this.ctx.moveTo(priceArea.x, getY(val));
        this.ctx.lineTo(priceArea.w, getY(val));
        this.ctx.stroke();
        this.ctx.fillStyle = '#22c55e';
        this.ctx.font = '8px monospace';
        this.ctx.fillText(`SUP: ${val.toFixed(2)}`, priceArea.w - 65, getY(val) - 3);
      });

      this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; // Resistance: Red
      (resistances || []).forEach(val => {
        this.ctx.beginPath();
        this.ctx.moveTo(priceArea.x, getY(val));
        this.ctx.lineTo(priceArea.w, getY(val));
        this.ctx.stroke();
        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = '8px monospace';
        this.ctx.fillText(`RES: ${val.toFixed(2)}`, priceArea.w - 65, getY(val) - 3);
      });
      this.ctx.setLineDash([]);
    }

    // 6. Draw RSI Sub-panel
    if (this.activeIndicators.rsi && ind) {
      this._drawSubGrid(rsiArea);
      this._drawRSIPanel(rsiArea, ind.rsi, getX, startIdx, endIdx);
    }

    // 7. Draw MACD Sub-panel
    if (this.activeIndicators.macd && ind) {
      this._drawSubGrid(macdArea);
      this._drawMACDPanel(macdArea, ind.macd, getX, startIdx, endIdx);
    }

    // 8. Price Labels Axis Y (Price Area)
    this._drawPriceAxis(priceArea, minPrice, maxPrice, getY);

    // 9. Date Axis X (Bottom)
    let dateAxisY = priceArea.y + priceArea.h + 15;
    if (this.activeIndicators.macd && macdArea) {
      dateAxisY = macdArea.y + macdArea.h + 15;
    } else if (this.activeIndicators.rsi && rsiArea) {
      dateAxisY = rsiArea.y + rsiArea.h + 15;
    }
    this._drawDateAxis(dateAxisY, getX, startIdx, endIdx);

    // 10. Interactive Crosshairs & Tooltip
    this._drawCrosshairs(w, h, priceArea, rsiArea, macdArea, getX, getY, ind);
  }

  /* ── Drawing Helpers ─────────────────────── */
  _drawGrid(area, min, max, getY) {
    this.ctx.strokeStyle = this.options.theme.grid;
    this.ctx.lineWidth = 1;
    
    // Horizontal lines
    const step = (max - min) / 6;
    for (let i = 1; i < 6; i++) {
      const p = min + step * i;
      const y = getY(p);
      this.ctx.beginPath();
      this.ctx.moveTo(area.x, y);
      this.ctx.lineTo(area.w, y);
      this.ctx.stroke();
    }
  }

  _drawSubGrid(area) {
    this.ctx.fillStyle = 'rgba(6, 182, 212, 0.01)';
    this.ctx.fillRect(area.x, area.y, area.w, area.h);
    this.ctx.strokeStyle = this.options.theme.grid;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(area.x, area.y, area.w, area.h);
    
    // Halfway mark line
    this.ctx.beginPath();
    this.ctx.moveTo(area.x, area.y + area.h / 2);
    this.ctx.lineTo(area.w, area.y + area.h / 2);
    this.ctx.stroke();
  }

  _drawPriceAxis(area, min, max, getY) {
    this.ctx.fillStyle = this.options.theme.text;
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'left';
    
    const step = (max - min) / 6;
    for (let i = 0; i <= 6; i++) {
      const p = min + step * i;
      const y = getY(p);
      this.ctx.fillText(p.toFixed(2), area.w + 10, y + 4);
    }
  }

  _drawDateAxis(y, getX, start, end) {
    this.ctx.fillStyle = this.options.theme.text;
    this.ctx.font = '9px monospace';
    this.ctx.textAlign = 'center';

    const step = Math.max(1, Math.floor((end - start) / 6));
    for (let i = start; i <= end; i += step) {
      let date = '';
      if (i < this.data.length) {
        date = this.data[i].date;
      } else {
        const f = this.forecastData[i - this.data.length];
        if (f) date = f.date;
      }
      if (!date) continue;
      // Format YYYY-MM-DD -> MM/DD
      const dateParts = date.split('-');
      const formatted = dateParts.length > 2 ? `${dateParts[1]}/${dateParts[2]}` : date;
      const x = getX(i) + this.candleWidth / 2;
      this.ctx.fillText(formatted, x, y);
    }
  }

  _drawLineIndicator(indicator, getX, getY, start, end, color, width = 1.5, dash = []) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    if (dash.length > 0) this.ctx.setLineDash(dash);

    this.ctx.beginPath();
    let first = true;
    for (let i = start; i <= end; i++) {
      if (i >= indicator.length) break;
      const val = indicator[i];
      if (val === null) continue;
      const x = getX(i) + this.candleWidth / 2;
      const y = getY(val);
      if (first) {
        this.ctx.moveTo(x, y);
        first = false;
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();
    if (dash.length > 0) this.ctx.setLineDash([]);
  }

  _drawRSIPanel(area, rsiData, getX, start, end) {
    // Threshold lines (30, 70)
    const getRsiY = (val) => area.y + area.h - (val / 100) * area.h;
    
    this.ctx.strokeStyle = 'rgba(236, 72, 153, 0.2)'; // Pink bounds
    this.ctx.lineWidth = 1;
    
    this.ctx.beginPath();
    this.ctx.moveTo(area.x, getRsiY(70));
    this.ctx.lineTo(area.w, getRsiY(70));
    this.ctx.moveTo(area.x, getRsiY(30));
    this.ctx.lineTo(area.w, getRsiY(30));
    this.ctx.stroke();
    
    this.ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
    this.ctx.font = '8px monospace';
    this.ctx.fillText('70', area.w - 20, getRsiY(70) - 3);
    this.ctx.fillText('30', area.w - 20, getRsiY(30) + 9);

    // RSI Line
    this.ctx.strokeStyle = '#a855f7'; // Purple RSI
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    let first = true;
    for (let i = start; i <= end; i++) {
      if (i >= this.data.length) break;
      const val = rsiData[i];
      if (val === null) continue;
      const x = getX(i) + this.candleWidth / 2;
      const y = getRsiY(val);
      if (first) { this.ctx.moveTo(x, y); first = false; }
      else this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();

    this.ctx.fillStyle = this.options.theme.text;
    this.ctx.font = '9px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('RSI (14)', area.x + 8, area.y + 12);
  }

  _drawMACDPanel(area, macdData, getX, start, end) {
    const { macdLine, signalLine, histogram } = macdData;
    
    // Find min-max for scaling Y inside window
    let maxMacdVal = 0.01;
    for (let i = start; i <= end; i++) {
      if (i >= this.data.length) break;
      maxMacdVal = Math.max(maxMacdVal, Math.abs(macdLine[i] || 0));
      maxMacdVal = Math.max(maxMacdVal, Math.abs(signalLine[i] || 0));
      maxMacdVal = Math.max(maxMacdVal, Math.abs(histogram[i] || 0));
    }
    
    const getMacdY = (val) => area.y + area.h / 2 - (val / maxMacdVal) * (area.h / 2);

    // Draw Histogram bars
    for (let i = start; i <= end; i++) {
      if (i >= this.data.length) break;
      const val = histogram[i];
      if (val === null) continue;
      
      const x = getX(i);
      const yZero = getMacdY(0);
      const yVal = getMacdY(val);
      const isPositive = val >= 0;
      
      this.ctx.fillStyle = isPositive ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';
      this.ctx.fillRect(x, Math.min(yZero, yVal), this.candleWidth, Math.abs(yZero - yVal));
    }

    // MACD Line (Amber) and Signal Line (Blue)
    this._drawLineIndicator(macdLine, getX, getMacdY, start, end, '#f59e0b', 1.2);
    this._drawLineIndicator(signalLine, getX, getMacdY, start, end, '#3b82f6', 1.2);

    this.ctx.fillStyle = this.options.theme.text;
    this.ctx.font = '9px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('MACD (12, 26, 9)', area.x + 8, area.y + 12);
  }

  _drawCrosshairs(w, h, priceArea, rsiArea, macdArea, getX, getY, ind) {
    if (this.mouse.x < 0 || this.mouse.x > priceArea.w) return;

    const candleStep = this.candleWidth + this.candleGap;
    
    // Find index hovered
    const idx = Math.floor((this.mouse.x - this.panOffset) / candleStep);
    const totalCount = this.data.length + (this.activeIndicators.forecast ? this.forecastData.length : 0);
    
    if (idx < 0 || idx >= totalCount) return;
    this.mouse.hoverIndex = idx;

    const targetX = getX(idx) + this.candleWidth / 2;

    // Draw vertical dotted line
    this.ctx.strokeStyle = this.options.theme.crosshair;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([3, 3]);
    
    this.ctx.beginPath();
    this.ctx.moveTo(targetX, 0);
    this.ctx.lineTo(targetX, h - 30);
    this.ctx.stroke();

    // Draw horizontal dotted line at mouse y inside main area
    if (this.mouse.y >= priceArea.y && this.mouse.y <= priceArea.y + priceArea.h) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.mouse.y);
      this.ctx.lineTo(priceArea.w, this.mouse.y);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]);

    // ─── Drawing Holographic Tooltip ───────────────────
    const isForecast = idx >= this.data.length;
    let titleStr = '';
    let rows = [];

    if (!isForecast) {
      const c = this.data[idx];
      titleStr = `DATE: ${c.date}`;
      rows = [
        `OPEN : ${c.open.toFixed(2)}`,
        `HIGH : ${c.high.toFixed(2)}`,
        `LOW  : ${c.low.toFixed(2)}`,
        `CLOSE: ${c.close.toFixed(2)}`,
        `VOL  : ${c.volume.toLocaleString()}`
      ];
      
      // Append calculated indicator metrics
      if (ind) {
        if (this.activeIndicators.sma && ind.sma[idx]) rows.push(`SMA20: ${ind.sma[idx].toFixed(2)}`);
        if (this.activeIndicators.ema && ind.ema[idx]) rows.push(`EMA10: ${ind.ema[idx].toFixed(2)}`);
        if (this.activeIndicators.rsi && ind.rsi[idx]) rows.push(`RSI  : ${ind.rsi[idx].toFixed(1)}`);
      }
    } else {
      const f = this.forecastData[idx - this.data.length];
      if (f) {
        titleStr = `PREDICT: ${f.date}`;
        rows = [
          `PATH : ${f.middle.toFixed(2)}`,
          `LIMIT+: ${f.upper.toFixed(2)}`,
          `LIMIT-: ${f.lower.toFixed(2)}`,
          `STATUS: QUANTUM FORWARD`
        ];
      }
    }

    // Position tooltip card neatly on left/right side of cursor
    const pad = 12;
    const cardW = 160;
    const cardH = 25 + rows.length * 15;
    let cardX = targetX + pad;
    let cardY = Math.min(priceArea.y + priceArea.h - cardH, Math.max(priceArea.y, this.mouse.y - cardH / 2));

    if (cardX + cardW > priceArea.w) {
      cardX = targetX - cardW - pad;
    }

    // Backdrop blur rectangle
    this.ctx.fillStyle = 'rgba(5, 7, 15, 0.9)';
    this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)'; // Cyan border
    this.ctx.lineWidth = 1;
    this.ctx.fillRect(cardX, cardY, cardW, cardH);
    this.ctx.strokeRect(cardX, cardY, cardW, cardH);

    // Corner highlights
    this.ctx.fillStyle = '#06b6d4';
    this.ctx.fillRect(cardX, cardY, 4, 1);
    this.ctx.fillRect(cardX, cardY, 1, 4);
    this.ctx.fillRect(cardX + cardW - 4, cardY, 4, 1);
    this.ctx.fillRect(cardX + cardW - 1, cardY, 1, 4);
    this.ctx.fillRect(cardX, cardY + cardH - 1, 4, 1);
    this.ctx.fillRect(cardX, cardY + cardH - 4, 1, 4);
    this.ctx.fillRect(cardX + cardW - 4, cardY + cardH - 1, 4, 1);
    this.ctx.fillRect(cardX + cardW - 1, cardY + cardH - 4, 1, 4);

    // Text metrics
    this.ctx.fillStyle = '#06b6d4';
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(titleStr, cardX + 10, cardY + 16);

    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.font = '9px monospace';
    rows.forEach((text, i) => {
      this.ctx.fillText(text, cardX + 10, cardY + 32 + i * 14);
    });
  }
}
