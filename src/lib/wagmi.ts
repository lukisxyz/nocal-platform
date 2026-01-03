import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia } from 'viem/chains';

export const config = getDefaultConfig({
  appName: 'NoCall Protocol',
  projectId: '568d8af63aa033ff1b617ecc8a15f835',
  chains: [arbitrumSepolia],
  ssr: true,
});
