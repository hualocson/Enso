import { CSSProperties } from "react";

const BottomBlur = () => {
  return (
    <div className='fixed z-10 left-0 right-0 h-[172px] select-none pointer-events-none bottom-0 flex-none'>
      <div className='absolute inset-0 overflow-hidden'>
        {Array.from({ length: 7 }).map((_, i) => {
          const unit = 0.1875;
          const blur = Math.pow(2, i + 1) * unit
          const progressUnit = 12.5
          const first = i * progressUnit


          return <div className='absolute inset-0'
            key={i}
            style={{
              opacity: 1,
              zIndex: i + 1,
              backdropFilter: `blur(${blur}px)`,
              maskImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) ${first}%, rgba(0, 0, 0, 1) ${first + progressUnit}%, rgba(0, 0, 0, 1) ${first + 2 * progressUnit}%, rgba(0, 0, 0, 0) ${first + 3 * progressUnit}%)`,
              WebkitMaskImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) ${first}%, rgba(0, 0, 0, 1) ${first + progressUnit}%, rgba(0, 0, 0, 1) ${first + 2 * progressUnit}%, rgba(0, 0, 0, 0) ${first + 3 * progressUnit}%)`,
            } as CSSProperties}
          />

        }
        )}
      </div>
    </div>
  )
}

export default BottomBlur
