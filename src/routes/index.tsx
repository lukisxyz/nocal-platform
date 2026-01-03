import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { ArrowRightIcon, Calendar, CheckCircle, Users } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen">
      <section className="py-20 px-4 h-screen flex items-center justify-center
        flex-row">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-7 text-gray-800 tracking-tight">
            Smart Scheduling<br />That Actually Works
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-7 max-w-xl mx-auto">
            One mentoring platform. Commit and attend.
            <br />
            Built to honor commitment and keep access open.
          </p>
          <Link to="/dashboard" className="py-3 px-6 inline-flex items-center gap-x-2 text-lg font-medium rounded-xl border border-transparent bg-gray-800 text-white hover:bg-gray-700 outline-hidden focus:ring-4 focus:ring-gray-400 disabled:opacity-50 disabled:pointer-events-none">
            Get Started
            <ArrowRightIcon className='size-4' />
          </Link>
        </div>
      </section>
      <section className="py-14">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-3.5 text-gray-800">Your Time Matters and Access Matters Too</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Designed to reduce no-shows while staying fair to those with limited budgets.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-100 border border-gray-200 p-8 rounded-xl">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">For Attendees</h3>
              <p className="text-gray-600">
                Commit to sessions you truly need. If your plans change and you can't attend,
                your commitment fee helps compensate the host for their reserved time.
              </p>
            </div>

            <div className="bg-gray-100 border border-gray-200 p-8 rounded-xl">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">For Mentors</h3>
              <p className="text-gray-600">
                Reduce no-shows and get compensated for time you've set aside.
                Focus on providing value to committed attendees who respect your time.
              </p>
            </div>

            <div className="bg-gray-100 border border-gray-200 p-8 rounded-xl">
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
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mt-8 text-3xl italic tracking-wide text-gray-600">
            Everyone knows that time is the most valuable resource.
            Our platform respects that value for both mentors and mentees.
          </p>
        </div>
      </section>
    </div>
  )
}
