import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { mplCore, MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";
import { PublicKey } from "@metaplex-foundation/umi";
import  signerWallet from "../wallets/wallet.json"

const umi = createUmi("http://localhost:8899", "confirmed").use(mplCore());
const programId = "5qCfMhUmbJmau9SGHP1qAEMfKwEzyyyQ846SMXX2y6w";

export function createManager(wallet: any) {
    umi.use(walletAdapterIdentity(wallet));
    const [managerPda] = wallet.publicKey.findProgramAddressSync(
        
    )
}
