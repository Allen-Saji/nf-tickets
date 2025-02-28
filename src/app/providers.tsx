"use client";
import { SessionProvider } from "next-auth/react";
import WalletContextProvider from "./WalletContextProvider";
import { TRPCReactProvider } from "@/trpc/react";
import { ReactQueryProvider } from "./react-query-provider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactQueryProvider>
      <TRPCReactProvider>
        <SessionProvider>
          <WalletContextProvider>{children}</WalletContextProvider>
        </SessionProvider>
      </TRPCReactProvider>
    </ReactQueryProvider>
  );
};
