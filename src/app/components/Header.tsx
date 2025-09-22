"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/app/styles/Header.module.css";
import { useMarket, type Base } from "@/app/context/MarketContext";
import ThemeToggle from "./ThemeToggle";
import {
  Bell, UserCircle, LogOut, Settings, HelpCircle, Keyboard,
  CheckCircle2, Info, AlertTriangle
} from "lucide-react";

export default function Header() {
  const { state, dispatch } = useMarket();
  const setBase = (b: Base) => dispatch({ type: "SET_BASE", base: b });

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* LEFT: Logo + Title */}
        <div className={styles.brand}>
          <img src="logo.png" alt="Melanion" className={styles.logo} />
          <h1 className={styles.title}>Melanion Demo</h1>
        </div>

        {/* RIGHT: Controls */}
        <div className={styles.controls}>
          <label className={styles.label}>Base</label>
          <div className={styles.selectWrap}>
            <select
              className={styles.select}
              value={state.base}
              onChange={(e) => setBase(e.target.value as Base)}
              aria-label="Base currency"
            >
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
              <option value="BNB">BNB</option>
            </select>
          </div>

          <ThemeToggle />

          {/* NEW: notifications dropdown */}
          <NotificationsMenu />

          {/* Existing: profile dropdown */}
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

/* ===================== Notifications dropdown ===================== */

type NotifType = "success" | "warning" | "info";
type Notif = {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  ts: number;   // epoch ms
  read: boolean;
};

function NotificationsMenu() {
  // demo seed data
  const [items, setItems] = useState<Notif[]>([
    {
      id: "n1",
      type: "success",
      title: "Order Filled",
      message: "BUY 0.12 BTC @ 112,520.00 USDT",
      ts: Date.now() - 1000 * 60 * 2,
      read: false,
    },
    {
      id: "n2",
      type: "warning",
      title: "Connection",
      message: "WebSocket reconnected after a temporary drop.",
      ts: Date.now() - 1000 * 60 * 17,
      read: false,
    },
    {
      id: "n3",
      type: "info",
      title: "New Feature",
      message: "Depth panel now supports click-to-fill.",
      ts: Date.now() - 1000 * 60 * 60 * 3,
      read: true,
    },
  ]);

  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const unread = useMemo(() => items.filter(i => !i.read).length, [items]);
  const badge = unread > 0 ? (unread > 9 ? "9+" : String(unread)) : undefined;

  // outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Escape to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })));
  const clearAll = () => setItems([]);

  const timeAgo = (ts: number) => {
    const d = Math.max(1, Math.round((Date.now() - ts) / 60000));
    if (d < 60) return `${d}m`;
    const h = Math.round(d / 60);
    return `${h}h`;
  };

  return (
    <div className={styles.menuAnchor} ref={anchorRef}>
      <button
        className={styles.iconBtn}
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        data-badge={badge} /* shows small pill if present (CSS handles it) */
      >
        <Bell size={22} />
      </button>

      {open && (
        <div className={styles.notif} role="menu" ref={menuRef}>
          <div className={styles.notifHead}>
            <div className={styles.notifTitle}>Notifications</div>
            <div className={styles.notifActions}>
              <button
                className={styles.notifAction}
                onClick={markAllRead}
                title="Mark all as read"
              >
                Mark read
              </button>
              <span className={styles.notifSep} />
              <button
                className={styles.notifAction}
                onClick={clearAll}
                title="Clear all notifications"
              >
                Clear
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className={styles.notifEmpty}>You’re all caught up 🎉</div>
          ) : (
            <div className={styles.notifList}>
              {items.map((n) => (
                <button
                  key={n.id}
                  className={`${styles.notifItem} ${!n.read ? styles.unread : ""}`}
                  onClick={() => setItems(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                  role="menuitem"
                >
                  <span className={`${styles.notifIcon} ${styles[n.type]}`}>
                    {n.type === "success" && <CheckCircle2 size={16} />}
                    {n.type === "warning" && <AlertTriangle size={16} />}
                    {n.type === "info" && <Info size={16} />}
                  </span>
                  <span className={styles.notifBody}>
                    <span className={styles.notifTitleText}>{n.title}</span>
                    <span className={styles.notifMsg}>{n.message}</span>
                  </span>
                  <span className={styles.notifTime}>{timeAgo(n.ts)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ========================= Profile dropdown ========================= */

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // roving focus inside menu
  const itemSelectors = `.${styles.menuItem}[tabindex="0"]`;
  const moveFocus = (dir: 1 | -1) => {
    const nodes = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>(itemSelectors) ?? []);
    const idx = nodes.findIndex((n) => n === document.activeElement);
    const next = nodes[(idx + dir + nodes.length) % nodes.length];
    next?.focus();
  };

  return (
    <div className={styles.menuAnchor} ref={anchorRef}>
      <button
        className={styles.iconBtn}
        aria-label="Profile"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <UserCircle size={24} />
      </button>

      {open && (
        <div
          className={styles.menu}
          role="menu"
          ref={menuRef}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); moveFocus(1); }
            if (e.key === "ArrowUp")   { e.preventDefault(); moveFocus(-1); }
            if (e.key === "Home")      { e.preventDefault(); (menuRef.current?.querySelector(itemSelectors) as HTMLElement)?.focus(); }
            if (e.key === "End")       { e.preventDefault(); [...(menuRef.current?.querySelectorAll(itemSelectors) ?? [])].pop()?.focus(); }
          }}
        >
          {/* Header */}
          <div className={styles.menuHeader}>
            <div className={styles.avatar}>
              <UserCircle size={20} />
            </div>
            <div className={styles.menuUser}>
              <div className={styles.menuName}>Guest User</div>
              <div className={styles.menuEmail}>guest@example.com</div>
            </div>
          </div>

          <div className={styles.menuDivider} />

          <button
            className={styles.menuItem}
            tabIndex={0}
            role="menuitem"
            onClick={() => console.log("Open Profile & Settings")}
          >
            <Settings size={16} />
            <span>Profile & Settings</span>
          </button>

          <button
            className={styles.menuItem}
            tabIndex={0}
            role="menuitem"
            onClick={() => console.log("Open Keyboard Shortcuts")}
          >
            <Keyboard size={16} />
            <span>Keyboard Shortcuts</span>
            <kbd className={styles.kbd}>?</kbd>
          </button>

          <button
            className={styles.menuItem}
            tabIndex={0}
            role="menuitem"
            onClick={() => console.log("Open Help / Feedback")}
          >
            <HelpCircle size={16} />
            <span>Help & Feedback</span>
          </button>

          <div className={styles.menuDivider} />

          <button
            className={`${styles.menuItem} ${styles.danger}`}
            tabIndex={0}
            role="menuitem"
            onClick={() => console.log("Sign out")}
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
