import { SiweButton } from '@/components/derived/siwe-button'
import { createFileRoute } from '@tanstack/react-router'
import { LottieAnimation } from '@/components/derived/lottie-animation';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 px-3.5 pt-7">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-7">
          <div className="text-center">
            <div className='w-full flex flex-col items-center'>
              <LottieAnimation loop={true} className='size-72' />
            </div>
            <h1 className="block text-2xl font-bold text-gray-800">Sign In</h1>
            <p className="mt-2 text-sm text-gray-600">
              Connect your wallet to continue
            </p>
          </div>
          <div className="mt-3.5">
            <SiweButton />
          </div>
        </div>
      </div>
    </div>
  )
}
