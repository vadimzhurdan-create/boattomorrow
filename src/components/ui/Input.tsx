import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  editorial?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, editorial, className = '', ...props }, ref) => {
    if (editorial) {
      return (
        <div className="w-full">
          <input
            ref={ref}
            className={`w-full border-0 border-b border-border bg-transparent py-3 text-base font-body placeholder:text-muted/60 focus:outline-none focus:border-text transition-colors ${
              error ? 'border-red-500' : ''
            } ${className}`}
            placeholder={label}
            {...props}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      )
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text mb-1">
            {label}
            {props.required && <span className="text-accent ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 border border-border bg-transparent text-text placeholder:text-muted/60 focus:outline-none focus:border-text transition-colors ${
            error ? 'border-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
