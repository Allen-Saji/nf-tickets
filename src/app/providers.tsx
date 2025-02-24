"use client";
import { SessionProvider } from "next-auth/react";
import WalletContextProvider from "./WalletContextProvider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <WalletContextProvider>{children}</WalletContextProvider>
    </SessionProvider>
  );
};
