import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'viem/chains';

export const config = getDefaultConfig({
  appName: 'NoCall Protocol',
  projectId: '568d8af63aa033ff1b617ecc8a15f835',
  chains: [baseSepolia],
  ssr: true,
});
