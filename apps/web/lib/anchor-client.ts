import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import idl from "./idl/remitsol.json";
import type { Remitsol } from "./idl/remitsol";

type WalletLike = {
  publicKey: AnchorProvider["wallet"]["publicKey"];
  signTransaction: AnchorProvider["wallet"]["signTransaction"];
  signAllTransactions: AnchorProvider["wallet"]["signAllTransactions"];
};

export function getProgram(connection: Connection, wallet: WalletLike) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return new Program<Remitsol>(idl as unknown as Remitsol, provider);
}
