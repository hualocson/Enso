import { cn } from '../utils'

const sizes = {
  sm: { img: 'w-6 h-6', },
  md: { img: 'w-8 h-8', },
  lg: { img: 'w-12 h-12', },
} as const

interface LogoProps {
  className?: string
  size?: keyof typeof sizes
  customImageClassName?: string
}

const Logo = ({ className, size = 'md', customImageClassName }: LogoProps) => {
  const { img } = sizes[size]
  return (
    <div className={cn('flex items-center', className)}>
      <img
        src="/logo-transparent.png"
        alt="Enso logo"
        className={cn(img, 'object-contain', customImageClassName)}
      />
    </div>
  )
}

export default Logo
