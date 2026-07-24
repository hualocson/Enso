import { cn } from '../utils'
import { IMAGE_SIZES, type ImageSizeKey } from '../constants'

interface ImageSizePickerProps {
    value: ImageSizeKey | ''
    onChange: (size: ImageSizeKey | '') => void
}

const ImageSizePicker = ({ value, onChange }: ImageSizePickerProps) => {
    return (
        <div>
            <label className="block text-sm font-medium text-foreground mb-2">
                Image Size
            </label>
            <div className="grid grid-cols-2 gap-2">
                {Object.entries(IMAGE_SIZES).map(([key, size]) => {
                    const isSelected = value === key

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() =>
                                onChange(isSelected ? '' : (key as ImageSizeKey))
                            }
                            className={cn(
                                'flex flex-col items-center justify-center p-3 rounded-lg border text-sm transition-colors w-full',
                                isSelected
                                    ? 'bg-accent text-surface border-accent'
                                    : 'bg-surface text-foreground border-border hover:border-accent',
                            )}
                        >
                            <span className="font-medium">{size.label}</span>
                            <span className="text-xs opacity-70 mt-1">
                                {size.width} &times; {size.height}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default ImageSizePicker