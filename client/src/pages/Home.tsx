import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Card, Loader } from '../components'
import { getErrorMessage, api } from '../utils'
import HeroSection from '../components/home/HeroSection'

interface Post {
  id: string
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
    return data.map((post) => <Card key={post.id} {...post} />)
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
    <section className="mb-44">
      <HeroSection />
      <div className='space-y-2 mb-32'>
        <span>
          Gallery
        </span>

        <div className="flex items-end justify-between gap-8">
          <h1 className="font-thin ml-10 text-foreground text-6xl">
            Inspiration
          </h1>
          <p className="text-foreground-secondary text-lg indent-6">
            Explore beautiful creations and share your own <br /> with the community.
          </p>
        </div>

      </div>

      <div className="mt-10">
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <div
            className='lg:columns-4 columns-1 sm:columns-2 md:columns-3 gap-2 space-y-2'
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
