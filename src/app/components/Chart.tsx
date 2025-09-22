"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./../styles/Chart.module.css";
import {
  createChart,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type UTCTimestamp,
  type TickMarkFormatter,
} from "lightweight-charts";
import axios from "axios";

type Interval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
type Candle = CandlestickData<UTCTimestamp>;

type Props = {
  /** Trading pair (default BTCUSDT) */
  symbol?: string;
  /** Kline interval (default 1m) */
  interval?: Interval;
  /** Number of historical candles to load initially (default 500) */
  limit?: number;
  /** Optional title shown above the chart */
  title?: string;
};

export default function RealTimeChart({
  symbol = "BTCUSDT",
  interval = "1m",
  limit = 500,
  title,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Create Chart ----------
  useEffect(() => {
    const el = containerRef.current!;
    const textColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--text")
        .trim() || "#E5E9F0";

    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight || 400,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,.06)" },
        horzLines: { color: "rgba(255,255,255,.06)" },
      },
      crosshair: { mode: 1 },
      rightPriceScale: {
        visible: true,
        borderColor: "rgba(255,255,255,.12)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,.12)",
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: ((time: UTCTimestamp) => {
          const d = new Date(time * 1000);
          return d.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }) as TickMarkFormatter<UTCTimestamp>,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      priceScaleId: "right",
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01,
      },
      upColor: "#00C853",
      borderUpColor: "#00C853",
      wickUpColor: "#00C853",
      downColor: "#FF5252",
      borderDownColor: "#FF5252",
      wickDownColor: "#FF5252",
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    const ro = new ResizeObserver(() => {
      chart.applyOptions({
        width: el.clientWidth,
        height: el.clientHeight || 400,
      });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // ---------- Helper to fetch Binance kline history ----------
  async function fetchKlines(sym: string, intv: string, lim: number) {
    const end = Date.now();
    const qs = `symbol=${sym}&interval=${intv}&limit=${lim}&endTime=${end}`;
    const url = `https://api.binance.com/api/v3/klines?${qs}`;
    const r = await axios.get(url, { timeout: 10000 });
    return r.data as any[];
  }

  // ---------- Load Historical Candles ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await fetchKlines(symbol, interval, limit);
        if (cancelled) return;

        const candles: Candle[] = raw.map((k) => ({
          time: Math.floor(k[0] / 1000) as UTCTimestamp,
          open: Number(k[1]),
          high: Number(k[2]),
          low: Number(k[3]),
          close: Number(k[4]),
        }));

        seriesRef.current?.setData(candles);
        chartRef.current?.timeScale().fitContent();
      } catch (err) {
        console.error(err);
        setError("Failed to load historical data from Binance.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [symbol, interval, limit]);

  // ---------- Real-Time Updates ----------
  useEffect(() => {
    wsRef.current?.close();
    const stream = `${symbol.toLowerCase()}@kline_${interval}`;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}`);
    wsRef.current = ws;

    ws.onmessage = (ev) => {
      try {
        const { k } = JSON.parse(ev.data);
        if (!k) return;
        const candle: Candle = {
          time: Math.floor(k.t / 1000) as UTCTimestamp,
          open: Number(k.o),
          high: Number(k.h),
          low: Number(k.l),
          close: Number(k.c),
        };
        seriesRef.current?.update(candle);
      } catch (e) {
        console.warn("[ws] parse error", e);
      }
    };

    return () => ws.close();
  }, [symbol, interval]);

  // ---------- Render ----------
  return (
    <div className={`${styles.card} card`}>
      <div className={styles.header}>
        <div className={styles.title}>
          {title ?? `Real-Time Price Chart (${symbol})`}
        </div>
        <div className={styles.pill}>{interval.toUpperCase()}</div>
      </div>

      <div ref={containerRef} className={styles.chart} />

      {loading && <div className={styles.overlay}>Loading candles…</div>}
      {error && <div className={styles.overlay}>{error}</div>}
    </div>
  );
}
