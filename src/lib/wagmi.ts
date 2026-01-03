import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia } from 'viem/chains';

export const config = getDefaultConfig({
  appName: 'NoCall Protocol',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [arbitrumSepolia],
  ssr: true,
});
