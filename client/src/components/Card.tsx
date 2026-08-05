import { Download } from 'iconoir-react'
import { cn, downloadImage } from '../utils'
import { CSSProperties } from 'react'

interface CardProps {
  id: string
  title?: string
  prompt?: string
  imageUrl: string
  tilt?: string
}

const Card = ({ id, title, prompt, imageUrl, tilt = "0deg" }: CardProps) => {
  return (
    <article className={cn("rounded-sm overflow-hidden relative isolate group",
      "transform scale-100 rotate-[var(--tilt,0deg)] hover:rotate-0 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
    )}
      style={{
        "--tilt": tilt
      } as CSSProperties}
    >
      <img
        className="w-full rounded-[inherit] h-full brightness-95 group-hover:brightness-75 transition-all duration-500 group-hover:scale-105 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        src={imageUrl}
        alt={prompt ?? title ?? 'Image'}
      />
      <span className='absolute inset-0 ring-1 rounded-[inherit] ring-black/10 z-10 ring-inset' />
      <span className='absolute inset-0 z-10 bg-gradient-to-5 from-black/80 via-black/30 to-transparent' />
      <div className="flex flex-col absolute bottom-0 left-0 right-0 p-4 rounded-md z-20 opacity-0 translate-y-full group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
        <div className="flex justify-between items-center gap-2">
          {title && (
            <p className="text-surface text-sm drop-shadow-xl font-semibold">{title}</p>
          )}
          <button
            type="button"
            onClick={() => downloadImage(id, imageUrl)}
            className="outline-none bg-transparent border-none text-white"
          >
            <Download className="size-5" />
          </button>
        </div>
      </div>
    </article>
  )
}

export default Card
