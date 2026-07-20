import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import sys
import ssl
from datetime import datetime

# Disable SSL verification for Yahoo Finance API requests
ssl_context = ssl._create_unverified_context()

class CustomProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path == '/api/chart':
            # Handle real Yahoo Finance API fetch proxy
            query_params = urllib.parse.parse_qs(parsed_url.query)
            ticker = query_params.get('ticker', ['AAPL'])[0].upper()
            timeframe = query_params.get('timeframe', ['daily'])[0].lower()
            
            # Map ticker to Yahoo Finance symbol format
            yahoo_ticker = ticker
            
            # Check if it is a Korean stock ticker (6 digits)
            if ticker.isdigit() and len(ticker) == 6:
                is_kosdaq = (ticker == '035900') # JYP Ent
                yahoo_ticker = f"{ticker}.KQ" if is_kosdaq else f"{ticker}.KS"
            # Check if it is Crypto (or you can check a set of tickers)
            elif ticker in ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT', 'AVAX', 'LINK', 
                            'MATIC', 'UNI', 'ATOM', 'LTC', 'ETC', 'FIL', 'NEAR', 'APT', 'ARB', 'OP', 
                            'ICP', 'STX', 'IMX', 'AAVE', 'MKR', 'CRV', 'RENDER', 'INJ', 'SEI', 'SUI', 
                            'TIA', 'JUP', 'WIF', 'PEPE', 'BONK', 'SHIB', 'FLOKI', 'MEME', 'ELON', 
                            'BABYDOGE', 'KISHU', 'SAMO', 'MYRO', 'POPCAT', 'MEW', 'BRETT', 'BOME', 
                            'SLERF', 'TREMP', 'MOTHER', 'GME_COIN', 'TRUMP', 'TURBO', 'LADYS', 'COQ', 'MOG']:
                if ticker == 'GME_COIN':
                    yahoo_ticker = "GME-USD"
                else:
                    yahoo_ticker = f"{ticker}-USD"
            
            range_val = '20y'
            interval_val = '1d'
            
            if timeframe == 'weekly':
                interval_val = '1wk'
            elif timeframe == 'monthly':
                range_val = 'max'
                interval_val = '1mo'
            elif timeframe == 'yearly':
                range_val = 'max'
                interval_val = '1mo'
            elif timeframe == 'minute':
                range_val = '5d'
                interval_val = '15m'
            elif timeframe == 'tick':
                range_val = '1d'
                interval_val = '1m'
                
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{yahoo_ticker}?range={range_val}&interval={interval_val}"
            
            try:
                req = urllib.request.Request(
                    url, 
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
                )
                with urllib.request.urlopen(req, timeout=15, context=ssl_context) as response:
                    res_data = json.loads(response.read().decode('utf-8'))
                    
                # Parse Yahoo format
                chart_result = res_data.get('chart', {}).get('result', [])
                if not chart_result:
                    raise ValueError("No chart data returned from Yahoo Finance")
                
                result_node = chart_result[0]
                timestamps = result_node.get('timestamp', [])
                indicators = result_node.get('indicators', {}).get('quote', [{}])[0]
                
                opens = indicators.get('open', [])
                highs = indicators.get('high', [])
                lows = indicators.get('low', [])
                closes = indicators.get('close', [])
                volumes = indicators.get('volume', [])
                adjcloses = result_node.get('indicators', {}).get('adjclose', [{}])[0].get('adjclose', [])
                
                candles = []
                
                yearly_buckets = {} if timeframe == 'yearly' else None
                
                for i in range(len(timestamps)):
                    if i >= len(opens) or i >= len(highs) or i >= len(lows) or i >= len(closes):
                        continue
                    ts = timestamps[i]
                    o = opens[i]
                    h = highs[i]
                    l = lows[i]
                    c = closes[i]
                    v = volumes[i] if (i < len(volumes) and volumes[i] is not None) else 0
                    ac = adjcloses[i] if i < len(adjcloses) and adjcloses[i] is not None else c
                    
                    # Guard null values from Yahoo
                    if o is None or h is None or l is None or c is None:
                        continue
                        
                    if ac is not None and c > 0 and abs(ac - c) > 0.001:
                        ratio = ac / c
                        o *= ratio
                        h *= ratio
                        l *= ratio
                        c = ac
                        v = int(v / ratio) if v > 0 else 0
                        
                    dt = datetime.fromtimestamp(ts)
                    
                    if timeframe in ['minute', 'tick']:
                        date_str = dt.strftime('%H:%M:%S') if timeframe == 'tick' else dt.strftime('%H:%M')
                    else:
                        date_str = dt.strftime('%Y-%m-%d')
                        
                    if timeframe == 'yearly':
                        year = dt.year
                        if year not in yearly_buckets:
                            yearly_buckets[year] = []
                        yearly_buckets[year].append({'open': o, 'high': h, 'low': l, 'close': c, 'volume': v, 'date': date_str})
                    else:
                        candles.append({
                            'date': date_str,
                            'open': round(o, 2),
                            'high': round(h, 2),
                            'low': round(l, 2),
                            'close': round(c, 2),
                            'volume': int(v)
                        })
                
                if timeframe == 'yearly':
                    for year in sorted(yearly_buckets.keys()):
                        chunk = yearly_buckets[year]
                        if not chunk: continue
                        o = chunk[0]['open']
                        c = chunk[-1]['close']
                        h = max(item['high'] for item in chunk)
                        l = min(item['low'] for item in chunk)
                        v = sum(item['volume'] for item in chunk)
                        candles.append({
                            'date': f"{year}-12-31",
                            'open': round(o, 2),
                            'high': round(h, 2),
                            'low': round(l, 2),
                            'close': round(c, 2),
                            'volume': int(v)
                        })
                
                # Send JSON response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(candles).encode('utf-8'))
                
            except Exception as e:
                # Send error details
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                error_response = {'error': str(e)}
                self.wfile.write(json.dumps(error_response).encode('utf-8'))
        else:
            super().do_GET()

if __name__ == '__main__':
    port = 8002
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
        
    server_address = ('', port)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(server_address, CustomProxyHandler)
    print(f"Proxy server running on port {port}")
    httpd.serve_forever()
