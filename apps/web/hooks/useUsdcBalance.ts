"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getUsdcUiBalance } from "@/lib/usdc";

export function useUsdcBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    const v = await getUsdcUiBalance(connection, publicKey);
    setBalance(v);
  }, [connection, publicKey]);

  useEffect(() => {
    refresh();
    if (!publicKey) return;
    const id = setInterval(refresh, 15_000);
    return () => clearInterval(id);
  }, [publicKey, refresh]);

  return { balance, refresh };
}
