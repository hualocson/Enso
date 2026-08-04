import Logo from "../Logo"

const HeroSection = () => {
  return (
    <div className="h-svh grid grid-cols-[repeat(16,_minmax(0,1fr))] gap-5 grid-rows-12 py-4">
      <span className="col-span-2 col-start-2 row-start-1">
        <img src="/home/image-1.png" />
      </span>
      <div className="col-span-2 row-span-2 col-start-8 text-2xl text-primary place-self-center">
        <div className="flex flex-col items-center justify-center">
          <Logo customImageClassName="size-20" />
          <h2 className="mt-[-16px] font-heading">Enso</h2>
        </div>
      </div>


      <span className="col-span-2 col-start-[14] row-start-2">
        <img src="/home/image-2.png" />
      </span>
      <p className="col-span-4 text-sm col-start-7 text-center row-start-3 place-self-center">
        Some ideas are easier to feel <br /> than to explain.
      </p>
      <div className="col-start-1 col-[14_/_span_16] row-start-4 text-center row-span-6 text-[160px] grid grid-cols-subgrid relative grid-rows-subgrid leading-[1.1]">
        <div className="col-span-full row-span-3 flex items-end justify-center">
          <p >A world of</p>
        </div>
        <div className="relative col-span-full font-heading grid grid-cols-subgrid row-span-3">
          <p className="absolute inset-0 after:z-10 after:absolute after:inset-0 after:[-webkit-text-stroke-width:2px] after:[-webkit-text-fill-color:transparent] after:[-webkit-text-stroke-color:var(--background)] after:content-['imagination']">imagination</p>
          <div className="col-span-2 col-start-8 z-0 absolute top-0 -translate-y-1/2 flex items-center justify-center">
            <img src="/home/image-3.png" className="w-2/3 2xl:w-[55%]" />
          </div>
        </div>
      </div>

      <span className="col-span-2 col-start-1 row-start-9">
        <img src="/home/image-4.png" />
      </span>

      <div className="col-span-4 col-start-7 mx-8">
        <button className="size-full bg-[#E77958] py-2 rounded-xl text-[#FCFAF7]">
          Explore
        </button>
      </div>

      <span className="col-span-2 col-end-[17] row-start-9">
        <img src="/home/image-5.png" />
      </span>

      <p className="col-span-6 col-start-6 text-center text-sm">A space for the ideas that live somewhere <br /> between thought and reality</p>
    </div>
  )
}

export default HeroSection
