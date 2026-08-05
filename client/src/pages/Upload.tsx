import React, { ChangeEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { MediaImage, Upload } from 'iconoir-react'
import { getErrorMessage, api } from '../utils'
import { FormField, Loader } from '../components'
import { toast } from 'sonner'

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

const MAX_FILE_SIZE = 50 * 1024 * 1024

const UploadPage = () => {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
  }, [preview])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null

    if (selected) {
      if (!ALLOWED_MIME_TYPES.has(selected.type)) {
        toast.error(`Unsupported image type: ${selected.type}`)
        return
      }

      if (selected.size > MAX_FILE_SIZE) {
        toast.error('File size must be 50MB or less')
        return
      }

      if (preview) URL.revokeObjectURL(preview)
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }

    e.target.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.warning('Please choose an image')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)
      if (title.trim()) formData.append('title', title.trim())

      await api.postForm('/api/v1/items/upload-file', formData)
      toast.success('Image uploaded successfully')
      navigate('/')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <div>
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
          Upload
        </h1>

        <p className="mt-2 max-w-xl text-sm text-foreground-secondary sm:text-base">
          Upload an image from your device and share it with the community.
        </p>
      </div>

      <form className="mt-10 lg:mt-16" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-10 lg:grid-cols-10">
          {/* Left */}
          <div className="flex flex-col gap-5 lg:col-span-7">
            <div>
              <label
                htmlFor="image"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Image
              </label>

              <input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => document.getElementById('image')?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-accent sm:w-fit"
              >
                <Upload className="size-4" />
                Choose Image
              </button>
            </div>

            <FormField
              labelName="Title (optional)"
              type="text"
              name="title"
              placeholder="My uploaded image"
              value={title}
              handleChange={(e) => setTitle(e.target.value)}
            />

            <button
              type="submit"
              className="w-full rounded-md bg-success px-5 py-2.5 text-sm font-medium text-surface transition hover:opacity-90 sm:w-fit"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-5 lg:col-span-3">
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
              {preview ? (
                <img
                  src={preview}
                  alt={title || 'Uploaded image'}
                  className="h-full w-full object-contain"
                />
              ) : (
                <MediaImage className="h-16 w-16 opacity-40" />
              )}

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader />
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </section>
  )
}

export default UploadPage
