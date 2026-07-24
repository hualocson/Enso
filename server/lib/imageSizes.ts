export const IMAGE_SIZES = {
    square: { width: 1024, height: 1024 },
    landscape: { width: 1920, height: 1080 },
    portrait: { width: 1080, height: 1920 },
    photo: { width: 1620, height: 1080 },
}

export type ImageSizeKey = keyof typeof IMAGE_SIZES
