import axios from "axios";

export type Ticker = {
  symbol: string;       // e.g., BTCUSDT
  lastPrice: number;
  priceChangePercent: number;
  volume: number;
};

export async function fetchTickersByBase(base: string): Promise<Ticker[]> {
  const { data } = await axios.get("https://api.binance.com/api/v3/ticker/24hr");
  const filtered = (data as any[])
    .filter((t) => (t.symbol as string).endsWith(base.toUpperCase()))
    .map((t) => ({
      symbol: t.symbol,
      lastPrice: Number(t.lastPrice),
      priceChangePercent: Number(t.priceChangePercent),
      volume: Number(t.volume)
    }))
    .sort((a, b) => b.volume - a.volume)  // most liquid first
    .slice(0, 50);
  return filtered;
}

export type DepthLevel = { price: number; qty: number };
export type OrderBook = { bids: DepthLevel[]; asks: DepthLevel[] };



export async function fetchOrderBook(symbol: string, limit = 25): Promise<OrderBook | null> {
    try {
      const res = await axios.get(
        `https://api.binance.com/api/v3/depth?symbol=${symbol.toUpperCase()}&limit=${limit}`,
        { timeout: 8000 }
      );
      const bids = (res.data.bids as [string, string][])
        .map(([p, q]) => ({ price: Number(p), qty: Number(q) }));
      const asks = (res.data.asks as [string, string][])
        .map(([p, q]) => ({ price: Number(p), qty: Number(q) }));
      if (!bids.length && !asks.length) return null;   // empty book
      return { bids, asks };
    } catch (e) {
      return null;
    }
  }
  