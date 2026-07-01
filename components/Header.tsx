'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/#causes', label: 'Nos causes' },
  { href: '/inscription', label: 'S\'inscrire' },
  { href: '/calendrier', label: 'Calendrier' },
  { href: '/presse', label: 'Presse' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-jcp.jpg" alt="Logo JCP" width={48} height={48} className="rounded-full object-cover" />
            <div className="hidden sm:block">
              <div className="font-bold text-[#1e3a5f] leading-tight text-sm">Judo Club</div>
              <div className="font-bold text-orange-500 leading-tight text-sm">Panonnais</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/#don" className="btn-primary text-sm py-2 px-4 hidden sm:inline-flex">
              Faire un don
            </Link>
            <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-700">
              {open ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-xl">
              {l.label}
            </Link>
          ))}
          <Link href="/#don" onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm font-semibold text-white bg-orange-500 rounded-xl text-center mt-2">
            Faire un don
          </Link>
        </div>
      )}
    </header>
  )
}
