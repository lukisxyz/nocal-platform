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
        name: 'theme-color',
        content: '#ffffff',
      },
      {
        title: 'NoCal Platform - Mentoring Platform',
      },
      {
        name: 'description',
        content: 'Mentoring platform built to honor commitment and keep access open',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '96x96',
        href: '/favicon-96x96.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '57x57',
        href: '/apple-icon-57x57.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '60x60',
        href: '/apple-icon-60x60.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '72x72',
        href: '/apple-icon-72x72.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '76x76',
        href: '/apple-icon-76x76.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '114x114',
        href: '/apple-icon-114x114.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '120x120',
        href: '/apple-icon-120x120.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '144x144',
        href: '/apple-icon-144x144.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '152x152',
        href: '/apple-icon-152x152.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-icon-180x180.png',
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-icon.png',
      },
      {
        rel: 'apple-touch-icon-precomposed',
        href: '/apple-icon-precomposed.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '36x36',
        href: '/android-icon-36x36.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '48x48',
        href: '/android-icon-48x48.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '72x72',
        href: '/android-icon-72x72.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '96x96',
        href: '/android-icon-96x96.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '144x144',
        href: '/android-icon-144x144.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        href: '/android-icon-192x192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '70x70',
        href: '/ms-icon-70x70.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '144x144',
        href: '/ms-icon-144x144.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '150x150',
        href: '/ms-icon-150x150.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '310x310',
        href: '/ms-icon-310x310.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'msapplication-TileImage',
        content: '/ms-icon-144x144.png',
      },
      {
        rel: 'msapplication-TileColor',
        content: '#ffffff',
      },
      {
        rel: 'browserconfig',
        href: '/browserconfig.xml',
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
