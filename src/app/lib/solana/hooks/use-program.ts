import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { program } from "../config";
export function useProgram() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  if (!wallet) {
    return { program: null, provider: null };
  }
  const provider = new AnchorProvider(connection, wallet, {});
  return { program, provider };
}
