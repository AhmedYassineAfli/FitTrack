import type { ReactNode, ChangeEvent } from "react"

interface InputProps {
  label: string
  placeholder?: string
  type?: string
  suffix?: ReactNode
  value?: string
  defaultValue?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  name?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function Input({
  label,
  placeholder,
  type = "text",
  suffix,
  value,
  defaultValue,
  onChange,
  name,
  required,
  disabled,
  className = "",
}: InputProps) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      <div className="input-wrap">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          name={name}
          required={required}
          disabled={disabled}
        />
        {suffix}
      </div>
    </label>
  )
}
