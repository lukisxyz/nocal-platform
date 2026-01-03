import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { ArrowRightIcon, Calendar, CheckCircle, Users } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen">
      <div>
        <nav className='max-w-5xl mx-auto p-3.5 flex items-center justify-between gap-3.5'>
          <Link to="/" className="flex items-center space-x-1.5 rtl:space-x-reverse">
            <img src="/favicon-96x96.png" className="h-7" alt="NoCal Platform Logo" />
            <span className="self-center text-xl font-semibold whitespace-nowrap text-heading">NoCal</span>
          </Link>
          <div className='flex items-center justify-end gap-7'>
            <a href="/#why" className='hover-underline-animation text-gray-700'>
              Why?
            </a>
            <Link to="/dashboard" className='hover-underline-animation text-gray-700'>
              Dashboard
            </Link>
          </div>
          <Link to="/login" className='py-1 px-3 inline-flex items-center gap-x-2 text-base font-medium rounded-lg border border-transparent bg-amber-800 text-white hover:bg-amber-700 outline-hidden focus:ring-4 focus:ring-amber-400 disabled:opacity-50 disabled:pointer-events-none'>Sign In</Link>
        </nav>
      </div>
      <section className="py-20 px-4 h-screen flex items-center justify-center
        flex-row">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-7 text-gray-800 tracking-tight">
            Smart Scheduling<br />That Actually <span className='text-amber-800'>Works</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-7 max-w-xl mx-auto">
            One mentoring platform. Commit and attend.
            <br />
            Built to honor commitment and keep access open.
          </p>
          <Link to="/dashboard" className="py-3.5 px-7 inline-flex items-center gap-x-2 text-lg font-medium rounded-full border border-transparent bg-amber-800 text-white hover:bg-amber-900 outline-hidden focus:ring-4 focus:ring-amber-400 disabled:opacity-50 disabled:pointer-events-none">
            Get Started
            <ArrowRightIcon className='size-4' />
          </Link>
        </div>
      </section>
      <section id="why" className="py-14">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-3.5 text-gray-800">Your Time Matters and Access Matters Too</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Designed to reduce no-shows while staying fair to those with limited budgets.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-100 border border-gray-200 p-7 rounded-xl">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">For Attendees</h3>
              <p className="text-gray-600">
                Commit to sessions you truly need. If your plans change and you can't attend,
                your commitment fee helps compensate the host for their reserved time.
              </p>
            </div>

            <div className="bg-gray-100 border border-gray-200 p-7 rounded-xl">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">For Mentors</h3>
              <p className="text-gray-600">
                Reduce no-shows and get compensated for time you've set aside.
                Focus on providing value to committed attendees who respect your time.
              </p>
            </div>

            <div className="bg-gray-100 border border-gray-200 p-7 rounded-xl">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Fair & Transparent</h3>
              <p className="text-gray-600">
                Everyone knows what to expect. Commitment-based booking creates a fair system
                where accountability benefits both parties.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="relative">
            <blockquote className="text-4xl font-extralight italic tracking-wide text-gray-500 leading-tight">
              "Time is free, but it's priceless. You can't own it, but you can use it.
              You can't keep it, but you can spend it. Once you've lost it you can never get it back."
            </blockquote>
            <div className="mt-7">
              <cite className="text-xl font-medium text-gray-500 not-italic">
                — Harvey Mackay
              </cite>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
