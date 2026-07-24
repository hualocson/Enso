import React, { ChangeEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { preview } from '../assets'
import { getRandomPrompt, getErrorMessage, api } from '../utils'
import { FormField, Loader, ImageSizePicker } from '../components'
import { IMAGE_SIZES, type ImageSizeKey } from '../constants'
import { toast } from 'sonner'

interface FormData {
    name: string
    prompt: string
    photo: string
}

const CreatePost = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState<FormData>({ name: '', prompt: '', photo: '' })
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
                await api.post('/api/v1/posts', form)
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
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }
    const handleSurpriseMe = () => {
        const randomPrompt = getRandomPrompt(form.prompt)
        setForm({ ...form, prompt: randomPrompt })
    }

    return (
        <section>
            <div>
                <h1 className="font-extrabold text-foreground text-[32px]">
                    Create
                </h1>
                <p className="mt-2 text-foreground-secondary text-[14px] max-w-[500px]">
                    Create imaginative and visually stunning images through AI
                    and share them.
                </p>
            </div>

            <form className="mt-16" onSubmit={handleSubmit}>
                <div className="grid grid-cols-10 gap-8">
                    <div className="col-span-7 flex flex-col gap-5">
                        <FormField
                            labelName="Your Name"
                            type="text"
                            name="name"
                            placeholder="Loc Son"
                            value={form.name}
                            handleChange={handleChange}
                        />{' '}
                        <FormField
                            labelName="Prompt"
                            type="text"
                            name="prompt"
                            placeholder="a bowl of soup that looks like a monster, knitted out of wool"
                            value={form.prompt}
                            handleChange={handleChange}
                            isSurpriseMe
                            handleSurpriseMe={handleSurpriseMe}
                        />
                        <ImageSizePicker value={size} onChange={setSize} />
                        <div className="flex gap-5">
                            <button
                                type="button"
                                onClick={generateImage}
                                className="text-surface bg-success font-medium rounded-md text-sm w-full px-5 py-2.5 text-center"
                            >
                                {generatingImg ? 'Generating...' : 'Generate Image'}
                            </button>
                        </div>
                    </div>
                    <div className="col-span-3 flex flex-col gap-5">
                        <div
                            className="relative bg-surface border border-border text-foreground text-sm rounded-lg focus:ring-accent focus:border-accent w-full flex justify-center items-center"
                            style={{
                                aspectRatio: `${
                                    size ? IMAGE_SIZES[size].width : IMAGE_SIZES.square.width
                                } / ${
                                    size ? IMAGE_SIZES[size].height : IMAGE_SIZES.square.height
                                }`,
                            }}
                        >
                            {form.photo ? (
                                <img
                                    src={form.photo}
                                    alt={form.prompt}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <img
                                    src={preview}
                                    alt="preview"
                                    className="w-9/12 h-9/12 object-contain opacity-40"
                                />
                            )}
                            {generatingImg && (
                                <div className="absolute inset-0 z-0 flex justify-center items-center bg-black/50 rounded-lg">
                                    <Loader />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-foreground-secondary text-[14px]">
                                Once you have created the image you want, you can share
                                it with others in the community
                            </p>
                            <button
                                type="submit"
                                className="mt-3 text-surface bg-accent font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                            >
                                {loading ? 'Sharing...' : 'Share with the community'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </section>
    )
}

export default CreatePost
