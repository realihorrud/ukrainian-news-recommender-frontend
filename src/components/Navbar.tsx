import { UserButton } from '@clerk/react'
import { NavLink } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition-colors ${
    isActive ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'
  }`

export default function Navbar() {
  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center gap-6 px-4 py-4">
        <NavLink to="/feed" className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-900">🇺🇦 Ukrainian News Recommender</span>
        </NavLink>

        <nav className="flex items-center gap-5">
          <NavLink to="/feed" className={navLinkClass}>
            Feed
          </NavLink>
          <NavLink to="/browse" className={navLinkClass}>
            Browse
          </NavLink>
          <NavLink to="/stats" className={navLinkClass}>
            Stats
          </NavLink>
        </nav>

        <div className="ml-auto">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'h-8 w-8',
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}
