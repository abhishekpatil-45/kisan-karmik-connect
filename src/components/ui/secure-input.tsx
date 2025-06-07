
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateInput } from "@/utils/securityHelpers";
import { cn } from "@/lib/utils";

export interface SecureInputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  inputType?: 'text' | 'email' | 'phone' | 'location' | 'fullName' | 'jobTitle' | 'jobDescription';
  maxLength?: number;
  onSecureChange?: (value: string) => void;
}

const SecureInput = React.forwardRef<HTMLInputElement, SecureInputProps>(
  ({ className, type, label, error, inputType = 'text', maxLength, onSecureChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let sanitizedValue = e.target.value;
      
      // Apply security validation based on input type
      switch (inputType) {
        case 'email':
          sanitizedValue = validateInput.email(sanitizedValue) || sanitizedValue;
          break;
        case 'phone':
          sanitizedValue = validateInput.phone(sanitizedValue) || sanitizedValue;
          break;
        case 'fullName':
          sanitizedValue = validateInput.fullName(sanitizedValue) || sanitizedValue;
          break;
        case 'location':
          sanitizedValue = validateInput.location(sanitizedValue);
          break;
        case 'jobTitle':
          sanitizedValue = validateInput.jobTitle(sanitizedValue);
          break;
        case 'jobDescription':
          sanitizedValue = validateInput.jobDescription(sanitizedValue);
          break;
        default:
          sanitizedValue = validateInput.string(sanitizedValue, maxLength);
      }
      
      // Update the input value
      e.target.value = sanitizedValue;
      
      // Call custom handler if provided
      if (onSecureChange) {
        onSecureChange(sanitizedValue);
      }
      
      // Call original onChange if provided
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className={error ? "text-red-500" : ""}>
            {label}
          </Label>
        )}
        <Input
          type={type}
          className={cn(
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          ref={ref}
          onChange={handleChange}
          maxLength={maxLength}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

SecureInput.displayName = "SecureInput";

export { SecureInput };
