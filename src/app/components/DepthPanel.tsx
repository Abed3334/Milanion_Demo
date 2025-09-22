// src/app/components/DepthPanel.tsx
"use client";

import { useEffect, useState } from "react";
import styles from "./../styles/DepthPanel.module.css";
import DepthChart from "./DepthChart";
import { fetchOrderBook, type OrderBook } from "@/app/lib/binance";

type Props = {
  symbol?: string | null; // e.g., "BTCUSDT"
};

export default function DepthPanel({ symbol }: Props) {
  const [book, setBook] = useState<OrderBook | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;
    let alive = true;
    setLoading(true);
    setErr(null);
    fetchOrderBook(symbol, 25)
      .then((b) => {
        if (!alive) return;
        if (!b) setErr("No depth data for this pair.");
        setBook(b || null);
      })
      .catch(() => alive && setErr("Failed to load order book."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [symbol]);

  return (
    <div className={styles.depthPanel}>
      <div className={styles.depthHeader}>
        <h3 className={styles.h3}>Order Book Depth</h3>
        <div className={styles.depthMeta}>
          {symbol ?? "—"}
          {loading && <span className={styles.loadingDot} aria-hidden>• • •</span>}
        </div>
      </div>
      <div className={styles.depthContent}>
        {err ? <div className={styles.depthMsg}>{err}</div> : <DepthChart book={book} />}
      </div>
    </div>
  );
}
