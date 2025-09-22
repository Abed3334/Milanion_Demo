"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./../styles/OrderForm.module.css";
import toastStyles from "./../styles/Toast.module.css";
import { CheckCircle, XCircle, X } from "lucide-react";

type Side = "BUY" | "SELL";

type Props = {
  symbol?: string; // e.g. "BTCUSDT"
  onOrderComplete?: () => void; // Callback when order is completed
};

type Notice = {
  id: string;
  side: Side;
  symbol: string;
  price: number;
  amount: number;
  total: number;
  ts: string; // ISO
};

export default function OrderForm({ symbol = "BTCUSDT", onOrderComplete }: Props) {
  const [side, setSide] = useState<Side>("BUY");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);

  // demo balance (you can wire this to real data later)
  const balance = useMemo(() => ({ quote: 10000, base: 2.5 }), []);

  const numericPrice = Number(price) || 0;
  const numericAmount = Number(amount) || 0;

  const total = numericPrice * numericAmount;
  const feeRate = 0.001; // 0.10% demo
  const fee = total * feeRate;
  const estCost = total + (side === "BUY" ? fee : 0);

  const disabled =
    !price || !amount || numericPrice <= 0 || numericAmount <= 0;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Notice = {
      id: Math.random().toString(36).slice(2, 8).toUpperCase(),
      side,
      symbol,
      price: numericPrice,
      amount: numericAmount,
      total: total || 0,
      ts: new Date().toISOString(),
    };

    console.log("[Demo Order Submitted]", payload);
    setNotice(payload);
    
    // Call the callback after a short delay to show the toast
    setTimeout(() => {
      onOrderComplete?.();
    }, 2000);
  };

  // auto-dismiss toast
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  // quick-size helpers
  const applyPercent = (pct: number) => {
    // BUY uses quote balance (USDT) → amount = (quote * pct / price)
    // SELL uses base balance (BTC)   → amount = base * pct
    if (side === "BUY") {
      if (!numericPrice) return;
      const amt = (balance.quote * pct) / numericPrice;
      setAmount(String(+amt.toFixed(6)));
    } else {
      const amt = balance.base * pct;
      setAmount(String(+amt.toFixed(6)));
    }
  };

  // slider is bound to amount (0 → max based on side)
  const sliderMax = side === "BUY"
    ? (numericPrice ? +(balance.quote / numericPrice).toFixed(6) : 0)
    : +balance.base.toFixed(6);

  return (
    <>
      <section className={`${styles.card} card`} aria-label="Order form">
        {/* Tabs */}
        <div className={styles.headerRow}>
          <div className={styles.tabs} role="tablist" aria-label="Order side">
            <button
              role="tab"
              aria-selected={side === "BUY"}
              className={`${styles.tab} ${side === "BUY" ? styles.tabActiveBuy : ""}`}
              onClick={() => setSide("BUY")}
            >
              Buy
            </button>
            <button
              role="tab"
              aria-selected={side === "SELL"}
              className={`${styles.tab} ${side === "SELL" ? styles.tabActiveSell : ""}`}
              onClick={() => setSide("SELL")}
            >
              Sell
            </button>
          </div>

          <div className={styles.symbol}>{symbol.replace("USDT", "/USDT")}</div>
        </div>

        {/* Balance strip */}
        <div className={styles.balanceRow} aria-live="polite">
          <div className={styles.balanceItem}>
            <span className={styles.k}>Quote</span>
            <span className={styles.v}>
              {balance.quote.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT
            </span>
          </div>
          <div className={styles.balanceItem}>
            <span className={styles.k}>Base</span>
            <span className={styles.v}>
              {balance.base.toLocaleString(undefined, { maximumFractionDigits: 6 })}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.row}>
            <label className={styles.label} htmlFor="price">Price</label>
            <label className={styles.label} htmlFor="amount">Amount</label>
          </div>

          <div className={styles.row}>
            <input
              id="price"
              inputMode="decimal"
              placeholder="0.00"
              className={styles.input}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <input
              id="amount"
              inputMode="decimal"
              placeholder="0.00"
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Quick size + slider */}
          <div className={styles.quickRow}>
            <div className={styles.quick}>
              <button type="button" onClick={() => applyPercent(0.25)}>25%</button>
              <button type="button" onClick={() => applyPercent(0.50)}>50%</button>
              <button type="button" onClick={() => applyPercent(0.75)}>75%</button>
              <button type="button" onClick={() => applyPercent(1)}>100%</button>
            </div>

            <input
              className={styles.range}
              type="range"
              min={0}
              max={sliderMax || 0}
              step={sliderMax ? Math.max(sliderMax / 100, 0.000001) : 1}
              value={numericAmount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Amount slider"
            />
          </div>

          {/* Summary grows to fill space and keeps CTA aligned to bottom */}
          <div className={styles.summary} aria-live="polite">
            <div className={styles.summaryItem}>
              <span className={styles.k}>Fee (0.10%)</span>
              <span className={styles.v}>
                {Number.isFinite(fee)
                  ? fee.toLocaleString(undefined, { maximumFractionDigits: 6 })
                  : "—"}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.k}>Est. Cost</span>
              <span className={styles.vStrong}>
                {Number.isFinite(estCost)
                  ? estCost.toLocaleString(undefined, { maximumFractionDigits: 6 })
                  : "—"}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className={`${styles.cta} ${side === "BUY" ? styles.ctaBuy : styles.ctaSell}`}
            disabled={disabled}
            aria-disabled={disabled}
          >
            {side === "BUY" ? "Buy" : "Sell"}
          </button>
        </form>
      </section>

      {/* Toast */}
      {notice && (
        <div
          className={`${toastStyles.toast} ${
            notice.side === "BUY" ? toastStyles.buy : toastStyles.sell
          }`}
          role="status"
          aria-live="polite"
        >
          <div className={toastStyles.left}>
            {notice.side === "BUY" ? (
              <CheckCircle className={toastStyles.icon} />
            ) : (
              <XCircle className={toastStyles.icon} />
            )}
          </div>

          <div className={toastStyles.body}>
            <div className={toastStyles.title}>
              {notice.side === "BUY" ? "Buy Order Placed" : "Sell Order Placed"}
            </div>
            <div className={toastStyles.sub}>
              #{notice.id} • {new Date(notice.ts).toLocaleTimeString()} •{" "}
              {notice.symbol.replace("USDT", "/USDT")}
            </div>
            <div className={toastStyles.grid}>
              <div>
                <span className={toastStyles.k}>Price</span>
                <span className={toastStyles.v}>
                  {notice.price.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                </span>
              </div>
              <div>
                <span className={toastStyles.k}>Amount</span>
                <span className={toastStyles.v}>
                  {notice.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                </span>
              </div>
              <div>
                <span className={toastStyles.k}>Total</span>
                <span className={toastStyles.vStrong}>
                  {notice.total.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                </span>
              </div>
            </div>
          </div>

          <button
            className={toastStyles.close}
            aria-label="Dismiss"
            onClick={() => setNotice(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
