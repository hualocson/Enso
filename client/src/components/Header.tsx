import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { cn } from '../utils'
import Logo from './Logo'

interface NavLinkProps {
  to: string
  children: React.ReactNode
  isActive?: boolean
}

const NavLink = ({ to, children, isActive }: NavLinkProps) => (
  <Link
    to={to}
    className={cn(
      'font-medium px-4 py-2 rounded-md transition-colors',
      isActive
        ? 'bg-accent text-surface hover:bg-accent-hover'
        : 'text-foreground-secondary hover:text-foreground'
    )}
  >
    {children}
  </Link>
)

const Header = () => {
  const { pathname } = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full transition-all duration-200',
      isScrolled
        ? 'bg-surface/80 backdrop-blur-md shadow-sm'
        : 'bg-background'
    )}>
      <div className="max-w-7xl mx-auto flex justify-between items-center sm:px-8 px-4 py-3">
        <Link to="/">
          <Logo size="lg" />
        </Link>

        <NavLink to="/create-post" isActive={pathname === '/create-post'}>
          Create
        </NavLink>
      </div>
    </header>
  )
}

export default Header
