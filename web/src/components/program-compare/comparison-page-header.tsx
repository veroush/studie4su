import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export function ComparisonPageHeader() {
  return (
    <header className="text-center mb-4">
      <Link
        to="/schools"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#15803d] transition-colors mb-4"
      >
        <ArrowLeft size={15} />
        Terug naar scholen
      </Link>

      <div className="flex items-center justify-center gap-5">
        <img
          src="/img/school_compare_face1.png"
          alt=""
          aria-hidden="true"
          className="hidden sm:block w-16 h-16 md:w-20 md:h-20 object-contain animate-[spinInLeft_0.8s_cubic-bezier(0.2,0.8,0.2,1)_0.1s_both]"
        />
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900">
          Opleidingen <span className="text-[#15803d]">Vergelijken</span>
          </h1>
          <p className="text-gray-600 text-lg mt-2">Vergelijk opleidingen naast elkaar</p>
        </div>
        <img
          src="/img/school_compare_face2.png"
          alt=""
          aria-hidden="true"
          className="hidden sm:block w-16 h-16 md:w-20 md:h-20 object-contain animate-[spinInRight_0.8s_cubic-bezier(0.2,0.8,0.2,1)_0.15s_both]"
        />
      </div>
    </header>
  )
}