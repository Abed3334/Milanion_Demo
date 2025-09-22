"use client";
import React, { useMemo } from "react";
import styles from "./../styles/DepthChart.module.css";
import type { OrderBook } from "@/app/lib/binance";

type Props = { book: OrderBook | null };

export default function DepthChart({ book }: Props) {
    const { bids, asks, maxQty } = useMemo(() => {
        if (!book) return { bids: [], asks: [], maxQty: 0 };
        let cum = 0;
        const b = book.bids
          .slice(0, 20) 
          .sort((a, b) => b.price - a.price)
          .map((l) => ({ price: l.price, cum: (cum += l.qty) }));
        let cum2 = 0;
        const a = book.asks
          .slice(0, 20)
          .sort((a1, a2) => a1.price - a2.price)
          .map((l) => ({ price: l.price, cum: (cum2 += l.qty) }));
        const maxQty = Math.max(b[b.length - 1]?.cum || 0, a[a.length - 1]?.cum || 0);
        return { bids: b, asks: a, maxQty };
      }, [book]);
      
      if (!book) return <div className="depthEmpty">No data</div>;
      if (!maxQty) return <div className="depthEmpty">No liquidity to show</div>;
      
  return (
    <div className={styles.wrap} aria-label="Order book depth">
      <div className={styles.side}>
        {bids.map((l, i) => (
          <div key={`b${i}`} className={styles.row}>
            <div className={styles.barBid} style={{ width: `${(l.cum / maxQty) * 100}%` }} />
            <span className={styles.lbl}>Bid</span>
          </div>
        ))}
      </div>
      <div className={styles.side}>
        {asks.map((l, i) => (
          <div key={`a${i}`} className={styles.row}>
            <div className={styles.barAsk} style={{ width: `${(l.cum / maxQty) * 100}%` }} />
            <span className={styles.lbl}>Ask</span>
          </div>
        ))}
      </div>
    </div>
  );
}
