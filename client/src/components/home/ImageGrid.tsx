import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, Loader } from '../../components/'
import { getErrorMessage, api } from '../../utils/'

interface Item {
  id: string
  type: 'upload' | 'generated'
  title?: string
  prompt?: string
  imageUrl: string
  width: number
  height: number
  createdAt: string
}

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


  const [loading, setLoading] = useState(false)
  const [allItems, setAllItems] = useState<Item[] | null>(null)

  const fetchItems = async () => {
    setLoading(true)

    try {
      const data = await api.get<Item[]>('/api/v1/items?limit=100')
      setAllItems(data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])
  return (
    <div className="mt-80" id="image-grid">
      {loading ? (
        <div className="flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <div
          className='columns-1 sm:columns-2 md:columns-3 gap-32 space-y-[180px]'
        >
          <RenderCards
            data={allItems}
            title="No Items Yet"
          />
        </div>
      )}
    </div>
  )
}

export default ImageGrid
