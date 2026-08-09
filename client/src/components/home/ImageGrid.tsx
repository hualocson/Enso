import { Card } from '../../components/'
import { useItems } from '../../hooks/'
import type { Item } from '../../api/'
import ImageGridSkeleton from './ImageGridSkeleton'

interface RenderCardsProps {
  data: Item[] | null
  title: string
}

const getDeg = (index: number): string => {
  switch (index % 8) {
    case 0:
      return "-2.2deg";
    case 1:
      return "1.8deg";
    case 2:
      return "-1.1deg";
    case 3:
      return "2.5deg";
    case 4:
      return "-0.7deg";
    case 5:
      return "1.3deg";
    case 6:
      return "-1.9deg";
    case 7:
      return "0.9deg";
    default:
      return "0deg";
  }
};

const RenderCards = ({ data, title }: RenderCardsProps) => {
  if (data && data.length > 0) {
    return data.map((item, index) => <Card key={item.id} {...item} tilt={getDeg(index)} />)
  }

  return (
    <h2 className="">
      {title}
    </h2>
  )
}

const ImageGrid = () => {
  const { data, isPending, isError } = useItems()

  return (
    <div className="md:mt-80 mt-40" id="image-grid">
      {isPending ? (
        <ImageGridSkeleton />
      ) : (
        <div
          className='columns-1 sm:columns-2 md:columns-3 md:gap-32 gap-12 space-y-[120px] md:space-y-[180px]'
        >
          <RenderCards
            data={data ?? null}
            title={isError ? "Ops! Something went wrong!" : "No Items Yet"}
          />
        </div>
      )}
    </div>
  )
}

export default ImageGrid
