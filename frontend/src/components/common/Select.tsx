import type { ReactNode, ChangeEvent } from "react"
import { ChevronDown } from "lucide-react"

interface SelectProps {
  label?: string
  children: ReactNode
  value?: string
  defaultValue?: string
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void
  name?: string
  className?: string
}

export function Select({
  label,
  children,
  value,
  defaultValue,
  onChange,
  name,
  className = "",
}: SelectProps) {
  return (
    <label className={`field ${className}`}>
      {label ? <span>{label}</span> : null}
      <div className="input-wrap">
        <select
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          name={name}
        >
          {children}
        </select>
        <ChevronDown size={16} />
      </div>
    </label>
  )
}
