import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import {
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import appCss from '../styles.css?url'
import { WagmiProvider } from 'wagmi'
import { config } from '@/lib/wagmi'
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import '@rainbow-me/rainbowkit/styles.css';
import { Toaster } from '@/components/ui/sonner'

const queryClient = new QueryClient();

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              {children}
              <Toaster position="bottom-left" />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
        <Scripts />
      </body>
    </html>
  )
}
