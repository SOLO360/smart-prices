import * as React from "react"
import { cn } from "@/lib/utils"

// Enhanced input props to handle more use cases
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue'> {
  // Allow string, number, or undefined for more flexible typing
  value?: string | number | undefined
  defaultValue?: string | number | undefined
  
  // Optional error state
  error?: boolean | string
  
  // Optional variant for different styling
  variant?: 'default' | 'ghost' | 'outline'
  
  // Optional custom size
  customSize?: 'sm' | 'md' | 'lg'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text', 
    value, 
    defaultValue, 
    error, 
    variant = 'default', 
    customSize = 'md',
    ...props 
  }, ref) => {
    // Determine if the input is controlled
    const isControlled = value !== undefined
    
    // Convert value to string to ensure consistent handling
    const inputValue = value !== undefined 
      ? String(value) 
      : (defaultValue !== undefined ? String(defaultValue) : undefined)

    // Generate variant-specific classes
    const variantClasses = {
      default: "bg-background border-input",
      ghost: "bg-transparent border-transparent hover:border-input",
      outline: "bg-background border-foreground/20"
    }

    // Generate size-specific classes
    const sizeClasses = {
      sm: "h-8 px-2 py-1 text-sm",
      md: "h-10 px-3 py-2 text-base md:text-sm",
      lg: "h-12 px-4 py-3 text-lg"
    }

    // Generate error-specific classes
    const errorClasses = error 
      ? "border-destructive focus-visible:ring-destructive" 
      : "border-input focus-visible:ring-ring"

    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            // Base input classes
            "flex w-full rounded-md border border-gray-300 ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            "placeholder:text-muted-foreground",
            
            // Focus and interaction states
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            
            // Variant-specific classes
            variantClasses[variant],
            
            // Size-specific classes
            sizeClasses[customSize],
            
            // Error handling
            errorClasses,
            
            // Additional custom classes
            className
          )}
          ref={ref}
          {...props}
          {...(isControlled 
            ? { value: inputValue } 
            : { defaultValue: inputValue }
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
        />
        
        {/* Optional error message rendering */}
        {error && typeof error === 'string' && (
          <p 
            id={`${props.id}-error`} 
            className="mt-1 text-sm text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }

// Usage Examples:
function InputExamples() {
  return (
    <div className="space-y-4">
      {/* Default input */}
      <Input placeholder="Default input" />
      
      {/* Controlled input */}
      <Input 
        value="Controlled value" 
        onChange={(e) => console.log(e.target.value)}
      />
      
      {/* Input with error */}
      <Input 
        error="Invalid input" 
        placeholder="Error state" 
      />
      
      {/* Ghost variant */}
      <Input 
        variant="ghost" 
        placeholder="Ghost input" 
      />
      
      {/* Small size input */}
      <Input 
        customSize="sm"
        placeholder="Small input" 
      />
      
      {/* Large size input */}
      <Input 
        customSize="lg"
        placeholder="Large input" 
      />
      
      {/* Disabled input */}
      <Input 
        disabled 
        placeholder="Disabled input" 
      />
    </div>
  )
}