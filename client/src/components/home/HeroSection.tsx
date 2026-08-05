import ImageReveal from "../animate/ImageReveal"
import TextReveal from "../animate/TextReveal"
import Logo from "../Logo"
import { motion } from "motion/react"

const HeroSection = () => {
  return (
    <div className="h-svh grid grid-cols-[repeat(16,_minmax(0,1fr))] gap-5 grid-rows-12 py-4">
      <ImageReveal className="col-span-2 col-start-2 row-start-1" src="/home/image-1.png" />

      <div className="col-span-2 row-span-2 col-start-8 text-2xl text-primary place-self-center">
        <div className="flex flex-col items-center justify-center">
          <Logo customImageClassName="size-20" />
          <h2 className="mt-[-16px] font-heading">Enso</h2>
        </div>
      </div>


      <ImageReveal className="col-span-2 col-start-[14] row-start-2" src="/home/image-2.png" />

      <p className="col-span-4 text-sm col-start-7 text-center row-start-3 place-self-center">
        <TextReveal text="Some ideas are easier to feel" className="text-sm" marginRight="4px" delay={0.5} />
        <TextReveal text="than to explain" delay={0.7} className="text-sm" marginRight="4px" />
      </p>
      <div className="col-start-1 col-[14_/_span_16] row-start-4 text-center row-span-6 text-[160px] grid grid-cols-subgrid relative grid-rows-subgrid leading-[1.1] overflow-hidden">
        <div className="col-span-full row-span-3 flex items-end justify-center overflow-hidden">
          {/* <p>A world of</p> */}
          <TextReveal text="A world of" className="text-[160px]" delay={0} duration={0.8} delayUnit={0.3} y={100} />
        </div>
        <div className="relative col-span-full font-heading grid grid-cols-subgrid row-span-3 ">
          <p className="absolute inset-0 after:z-10 after:absolute after:inset-0 after:[-webkit-text-stroke-width:2px] after:[-webkit-text-fill-color:transparent] after:[-webkit-text-stroke-color:var(--background)] animate-[reveal-up_0.8s_var(--ease-minor-spring)] after:content-['imagination']"
          >imagination</p>
          <div className="col-span-2 col-start-8 z-0 absolute top-0 -translate-y-1/2 flex items-center justify-center isolate">
            <ImageReveal className="w-[75%]" src="/home/image-3.png" />
          </div>

        </div>
      </div>

      <ImageReveal className="col-span-2 col-start-1 row-start-8" src="/home/image-4.png" />

      <div className="col-span-4 col-start-7 mx-8">
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.5
          }}
          className="size-full bg-[#E77958] py-2 rounded-xl text-[#FCFAF7] font-semibold">
          Explore
        </motion.button>
      </div>

      <ImageReveal className="col-span-2 col-end-[17] row-start-9" src="/home/image-5.png" />

      <p className="col-span-6 col-start-6 text-center text-sm row-end-13">
        <TextReveal text="A space for the ideas that live somewhere" delay={0.5} className="text-sm" marginRight="4px" />
        <TextReveal text="between thought and reality" delay={0.7} className="text-sm" marginRight="4px" />
      </p>
    </div>
  )
}

export default HeroSection
