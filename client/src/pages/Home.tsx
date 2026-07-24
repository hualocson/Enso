import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Card, Loader } from '../components'
import { getErrorMessage, api } from '../utils'

interface Post {
  _id: string
  name: string
  prompt: string
  photo: string
}

interface RenderCardsProps {
  data: Post[] | null
  title: string
}

const RenderCards = ({ data, title }: RenderCardsProps) => {
  if (data && data.length > 0) {
    return data.map((post) => <Card key={post._id} {...post} />)
  }

  return (
    <h2 className="mt-5 font-bold text-accent text-xl uppercase">
      {title}
    </h2>
  )
}

const Home = () => {
  const [loading, setLoading] = useState(false)
  const [allPosts, setAllPosts] = useState<Post[] | null>(null)

  const fetchPosts = async () => {
    setLoading(true)

    try {
      const data = await api.get<Post[]>('/api/v1/posts')
      setAllPosts(data.reverse())
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return (
    <section className="max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className="font-extrabold text-foreground text-[48px]">
          Inspiration
        </h1>
        <p className="mt-2 text-foreground-secondary text-[18px]">
          Find ideas. Remix prompts. Create something new.
        </p>
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <div
            className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 place-items-start grid-flow-row-dense"
          >
            <RenderCards
              data={allPosts}
              title="No Posts Yet"
            />
          </div>
        )}
      </div>
    </section>
  )
}

export default Home
