"use client";

import { useState } from "react";
import { ShoppingCart, X } from "lucide-react";
import OrderForm from "./OrderForm";
import styles from "../styles/FloatingOrderButton.module.css";

export default function FloatingOrderButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className={styles.floatingButton}
        onClick={handleToggle}
        aria-label="Open order form"
      >
        <ShoppingCart size={20} />
        <span className={styles.buttonText}>Order</span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={handleClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Place Order</h2>
              <button
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Close order form"
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <OrderForm onOrderComplete={handleClose} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
