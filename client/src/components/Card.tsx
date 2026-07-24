import { download } from '../assets'
import { downloadImage } from '../utils'

interface CardProps {
  _id: string
  name: string
  prompt: string
  photo: string
}

const Card = ({ _id, name, prompt, photo }: CardProps) => {
  return (
    <article className="rounded-xl overflow-hidden relative isolate group">
      <img
        className="w-full rounded-[inherit] h-full"
        src={photo}
        alt={prompt}
      />
      <span className='absolute inset-0 ring-1 rounded-[inherit] ring-black/10 dark:ring-white/10 z-10 ring-inset' />
      <div className="group-hover:flex flex-col max-h-[60%] hidden absolute bottom-0 left-0 right-0 bg-foreground p-4 rounded-md z-20">
        <p className="text-surface text-md overflow-y-auto prompt">
          {prompt}
        </p>
        <div className="mt-5 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full object-cover bg-success flex justify-center items-center text-surface text-xs font-bold">
              {name[0]}
            </div>
            <p className="text-surface text-sm">{name}</p>
          </div>
          <button
            type="button"
            onClick={() => downloadImage(_id, photo)}
            className="outline-none bg-transparent border-none"
          >
            <img
              src={download}
              alt="download"
              className="w-6 h-6 object-contain invert"
            />
          </button>
        </div>
      </div>
    </article>
  )
}

export default Card
