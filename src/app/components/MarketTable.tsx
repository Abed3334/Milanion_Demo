"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./../styles/MarketTable.module.css";
import { useMarket } from "@/app/context/MarketContext";
import { fetchTickersByBase, type Ticker } from "@/app/lib/binance";
import { fmtPrice, fmtVol, nf2 } from "@/app/lib/format";
import { useBinanceMiniTicker } from "./../hooks/useBinance";

type Props = { onSelect?: (symbol: string) => void };

export default function MarketTable({ onSelect }: Props) {
  const { state } = useMarket();

  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when base changes
  useEffect(() => setPage(1), [state.base]);

  // Fetch initial tickers for the selected base
  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await fetchTickersByBase(state.base);
      if (!alive) return;
      setTickers(list);
      const first = list[0]?.symbol ?? null;
      setSelected(first);
      if (first) onSelect?.(first); // notify parent for DepthPanel
    })();
    return () => {
      alive = false;
    };
  }, [state.base, onSelect]);

  // Row click highlights and notifies DepthPanel
  const handleClick = (sym: string) => {
    setSelected(sym);
    onSelect?.(sym);
  };

  // Live updates via WebSocket mini-ticker
  const onBatch = useCallback(
    (map: Record<string, { lastPrice: number; priceChangePercent: number; volume: number }>) => {
      setTickers((prev) =>
        prev.map((t) => (map[t.symbol] ? { ...t, ...map[t.symbol] } : t))
      );
    },
    []
  );
  useBinanceMiniTicker(onBatch);

  // Pagination calculations
  const total = tickers.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const start = (clampedPage - 1) * pageSize;
  const end = start + pageSize;
  const rows = useMemo(() => tickers.slice(start, end), [tickers, start, end]);

  const goTo = (p: number) =>
    setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <section className="container" aria-label="Market data">
      <div className={`${styles.wrap} card`}>
        <div className={styles.headerRow}>
          <h2 className={styles.h2}>Market</h2>
          {selected && (
            <div className={styles.sel}>
              Selected: <strong>{selected}</strong>
            </div>
          )}
        </div>

        {/* Table Header */}
        <div className={styles.gridHead} role="row">
          <div>Pair</div>
          <div>Last</div>
          <div>24h %</div>
          <div>24h Vol</div>
        </div>

        {/* Table Body */}
        <div className={styles.body} role="rowgroup">
          {rows.map((t) => {
            const neg = t.priceChangePercent < 0;
            const isActive = selected === t.symbol;
            return (
              <button
                key={t.symbol}
                className={`${styles.row} ${isActive ? styles.active : ""}`}
                onClick={() => handleClick(t.symbol)}
                aria-pressed={isActive}
                title={`Select ${t.symbol}`}
              >
                <div className={styles.pair}>{t.symbol}</div>
                <div className={styles.last}>{fmtPrice(t.lastPrice)}</div>
                <div className={neg ? styles.neg : styles.pos}>
                  {nf2.format(t.priceChangePercent)}%
                </div>
                <div className={styles.vol}>{fmtVol(t.volume)}</div>
              </button>
            );
          })}
        </div>

        {/* Styled Pagination */}
        <div className={styles.pagination} role="navigation" aria-label="Table pagination">
          <div className={styles.pageInfo}>
            Showing <strong>{rows.length}</strong> of <strong>{total}</strong>
          </div>

          <div className={styles.pageControls}>
            <button
              className={styles.pageBtn}
              onClick={() => goTo(1)}
              disabled={clampedPage === 1}
              aria-label="First page"
            >
              «
            </button>

            <button
              className={styles.pageBtn}
              onClick={() => goTo(clampedPage - 1)}
              disabled={clampedPage === 1}
              aria-label="Previous page"
            >
              ‹
            </button>

            <span className={styles.pageNow}>
              Page <strong>{clampedPage}</strong> / {totalPages}
            </span>

            <button
              className={styles.pageBtn}
              onClick={() => goTo(clampedPage + 1)}
              disabled={clampedPage === totalPages}
              aria-label="Next page"
            >
              ›
            </button>

            <button
              className={styles.pageBtn}
              onClick={() => goTo(totalPages)}
              disabled={clampedPage === totalPages}
              aria-label="Last page"
            >
              »
            </button>
          </div>

          <div className={styles.pageSizeWrap}>
            <label className={styles.pageSizeLabel}>Rows</label>
            <select
              className={styles.pageSize}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              aria-label="Rows per page"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
