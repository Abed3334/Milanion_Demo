"use client";
import { useEffect, useRef } from "react";

// Subscribe to mini-ticker stream for multiple symbols: !miniTicker@arr
// We’ll locally filter to the symbols we render for cheap updates.
type MiniTicker = {
  s: string;  // symbol
  c: string;  // close price
  P: string;  // priceChangePercent
  v: string;  // base asset volume
};

export function useBinanceMiniTicker(
  onBatch: (updates: Record<string, { lastPrice: number; priceChangePercent: number; volume: number }>) => void
) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = "wss://stream.binance.com:9443/ws/!miniTicker@arr";
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (ev) => {
      try {
        const arr = JSON.parse(ev.data) as MiniTicker[];
        const map: Record<string, { lastPrice: number; priceChangePercent: number; volume: number }> = {};
        for (const t of arr) {
          map[t.s] = {
            lastPrice: Number(t.c),
            priceChangePercent: Number(t.P),
            volume: Number(t.v),
          };
        }
        onBatch(map);
      } catch {
        // ignore
      }
    };

    return () => {
      ws.close();
    };
  }, [onBatch]);
}
