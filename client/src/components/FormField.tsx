import { ChangeEvent } from 'react'

interface FormFieldProps {
    labelName?: string
    type?: string
    name: string
    placeholder?: string
    value: string
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    isSurpriseMe?: boolean
    handleSurpriseMe?: () => void
    rows?: number
}

const FormField = ({
    labelName,
    type,
    name,
    placeholder,
    value,
    handleChange,
    isSurpriseMe,
    handleSurpriseMe,
    rows = 5,
}: FormFieldProps) => {
    const inputClasses =
        'bg-surface border border-border text-foreground text-sm rounded-lg focus:ring-accent focus:border-accent outline-none block w-full p-3'

    const textareaClasses =
        'bg-surface border border-border text-foreground text-sm rounded-lg focus:ring-accent focus:border-accent outline-none block w-full p-3 resize-none'

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-foreground"
                >
                    {labelName}
                </label>
                {isSurpriseMe && (
                    <button
                        type="button"
                        onClick={handleSurpriseMe}
                        className="font-semibold text-xs bg-surface-secondary py-1 px-2 rounded-[5px] text-foreground"
                    >
                        Surprise me
                    </button>
                )}
            </div>
            {type === 'textarea' ? (
                <textarea
                    name={name}
                    id={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    required
                    rows={rows}
                    className={textareaClasses}
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    id={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                />
            )}
        </div>
    )
}

export default FormField
