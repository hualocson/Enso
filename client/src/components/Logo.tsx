import { cn } from '../utils'

const sizes = {
    sm: { img: 'w-6 h-6', text: 'text-base' },
    md: { img: 'w-8 h-8', text: 'text-xl' },
    lg: { img: 'w-12 h-12', text: 'text-3xl' },
} as const

interface LogoProps {
    showText?: boolean
    className?: string
    size?: keyof typeof sizes
}

const Logo = ({ showText = true, className, size = 'md' }: LogoProps) => {
    const { img, text } = sizes[size]
    return (
        <div className={cn('flex items-center', className)}>
            <img
                src="/logo-transparent.png"
                alt="Enso logo"
                className={cn(img, 'object-contain')}
            />
            {showText && (
                <span className={cn('font-heading text-foreground', text)}>
                    Enso
                </span>
            )}
        </div>
    )
}

export default Logo
