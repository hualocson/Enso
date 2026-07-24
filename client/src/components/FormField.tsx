import { ChangeEvent } from 'react'

interface FormFieldProps {
    labelName?: string
    type?: string
    name: string
    placeholder?: string
    value: string
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void
    isSurpriseMe?: boolean
    handleSurpriseMe?: () => void
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
}: FormFieldProps) => {
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
            <input
                type={type}
                name={name}
                id={name}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                required
                className="bg-surface border border-border text-foreground text-sm rounded-lg focus:ring-accent focus:border-accent outline-none block w-full p-3"
            />
        </div>
    )
}

export default FormField
