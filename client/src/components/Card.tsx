import { Download } from 'iconoir-react'
import { downloadImage } from '../utils'

interface CardProps {
  id: string
  name: string
  prompt: string
  photo: string
}

const Card = ({ id, name, prompt, photo }: CardProps) => {
  return (
    <article className="rounded-md overflow-hidden relative isolate group">
      <img
        className="w-full rounded-[inherit] h-full brightness-95 group-hover:brightness-75 transition-all duration-300"
        src={photo}
        alt={prompt}
      />
      <span className='absolute inset-0 ring-1 rounded-[inherit] ring-black/10 z-10 ring-inset' />
      <span className='absolute inset-0 z-10 bg-gradient-to-5 from-black/80 via-black/30 to-transparent' />
      <div className="flex flex-col absolute bottom-0 left-0 right-0 p-4 rounded-md z-20">
        <div className="flex justify-between items-center gap-2">
          <p className="text-surface text-sm drop-shadow-xl font-semibold">{name}</p>
          <button
            type="button"
            onClick={() => downloadImage(id, photo)}
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
