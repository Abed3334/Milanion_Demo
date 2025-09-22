"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";

export type Base = "BTC" | "ETH" | "USDT" | "BNB";

type State = {
  base: Base;
};

type Action = { type: "SET_BASE"; base: Base };

const initialState: State = { base: "BTC" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_BASE":
      return { ...state, base: action.base };
    default:
      return state;
  }
}

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export function MarketProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useMarket() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMarket must be used within MarketProvider");
  return ctx;
}
