import { Link, useLocation } from 'react-router-dom'
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

    return (
        <header className="sticky top-0 z-50 w-full bg-surface">
            <div className="max-w-7xl mx-auto flex justify-between items-center sm:px-8 px-4 py-3">
                <Link to="/">
                    <Logo size="sm" />
                </Link>

                <NavLink to="/create-post" isActive={pathname === '/create-post'}>
                    Create
                </NavLink>
            </div>
        </header>
    )
}

export default Header
