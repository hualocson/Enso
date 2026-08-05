import React, { ChangeEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { MediaImage } from 'iconoir-react'
import { getRandomPrompt, getErrorMessage, api } from '../utils'
import { FormField, Loader, ImageSizePicker } from '../components'
import { IMAGE_SIZES, type ImageSizeKey } from '../constants'
import { toast } from 'sonner'

interface FormData {
  title: string
  prompt: string
  photo: string
}

const GenerateImage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>({ title: '', prompt: '', photo: '' })
  const [loading, setLoading] = useState(false)
  const [generatingImg, setGeneratingImg] = useState(false)
  const [size, setSize] = useState<ImageSizeKey | ''>('square')

  const generateImage = async () => {
    if (form.prompt) {
      try {
        setGeneratingImg(true)
        const body: Record<string, string> = { prompt: form.prompt }
        if (size) body.size = size
        const data = await api.post<{ photo: string }>(
          '/api/v1/dalle',
          body,
        )

        setForm({
          ...form,
          photo: `data:image/jpeg;base64,${data.photo}`,
        })
      } catch (error) {
        toast.error(getErrorMessage(error))
      } finally {
        setGeneratingImg(false)
      }
    } else {
      toast.warning('Please enter a prompt')
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.prompt && form.photo) {
      setLoading(true)

      try {
        await api.post('/api/v1/items/upload-ai-image', form)
        navigate('/')
      } catch (error) {
        toast.error(getErrorMessage(error))
      } finally {
        setLoading(false)
      }
    } else {
      toast.warning('Please enter a prompt and generate an image')
    }
  }
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt)
    setForm({ ...form, prompt: randomPrompt })
  }

  return (
    <section>
      <div>
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
          Create
        </h1>

        <p className="mt-2 max-w-xl text-sm text-foreground-secondary sm:text-base">
          Create imaginative and visually stunning images through AI and share them.
        </p>
      </div>

      <form className="mt-10 lg:mt-16" onSubmit={handleSubmit}>
        <div className="grid gap-10 lg:grid-cols-10">
          {/* Left */}
          <div className="flex flex-col gap-5 lg:col-span-7">
            <FormField
              labelName="Title"
              type="text"
              name="title"
              placeholder="Type something..."
              value={form.title}
              handleChange={handleChange}
            />

            <FormField
              labelName="Prompt"
              type="textarea"
              name="prompt"
              placeholder="a bowl of soup that looks like a monster, knitted out of wool"
              value={form.prompt}
              handleChange={handleChange}
              isSurpriseMe
              handleSurpriseMe={handleSurpriseMe}
            />

            <ImageSizePicker
              value={size}
              onChange={setSize}
            />

            <button
              type="button"
              onClick={generateImage}
              className="w-full rounded-md bg-success px-5 py-2.5 text-sm font-medium text-surface transition hover:opacity-90 sm:w-fit"
            >
              {generatingImg ? "Generating..." : "Generate Image"}
            </button>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-5 lg:col-span-3">
            <div
              className="relative flex w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-surface"
              style={{
                aspectRatio: `${size
                  ? IMAGE_SIZES[size].width
                  : IMAGE_SIZES.square.width
                  } / ${size
                    ? IMAGE_SIZES[size].height
                    : IMAGE_SIZES.square.height
                  }`,
              }}
            >
              {form.photo ? (
                <img
                  src={form.photo}
                  alt={form.prompt}
                  className="h-full w-full object-contain"
                />
              ) : (
                <MediaImage className="h-16 w-16 opacity-40" />
              )}

              {generatingImg && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-foreground-secondary">
                Once you have created the image you want, you can share it with
                others in the community.
              </p>

              <button
                type="submit"
                className="mt-4 w-full rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-surface transition hover:opacity-90"
              >
                {loading ? "Sharing..." : "Share with the community"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  )
}

export default GenerateImage
