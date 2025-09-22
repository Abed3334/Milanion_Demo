"use client";
import { useState } from "react";
import Header from "./components/Header";
import MarketTable from "./components/MarketTable";
import Chart from "./components/Chart";
import OrderForm from "./components/OrderForm";
import DepthPanel from "./components/DepthPanel";
import FloatingOrderButton from "./components/FloatingOrderButton";
import styles from "./styles/Layout.module.css";

export default function Home() {
  const [depthSymbol, setDepthSymbol] = useState<string | null>(null);

  return (
    <main className={styles.dashboard}>
      <Header />

      {/* Top row: Market + Chart */}
      <section className={styles.row}>
        <div className={styles.left}>
          <MarketTable onSelect={setDepthSymbol} />
        </div>
        <div className={styles.right}>
          <Chart symbol="BTCUSDT" interval="1m" />
        </div>
      </section>

      {/* Bottom row: Order + Depth */}
      <section className={styles.row}>
        <div className={styles.left}>
          <DepthPanel symbol={depthSymbol ?? "BTCUSDT"} />
        </div>
        <div className={styles.right}>
          <div className={styles.desktopOrderForm}>
            <OrderForm />
          </div>
        </div>
      </section>

      {/* Floating Order Button for Mobile */}
      <FloatingOrderButton />
    </main>
  );
}
