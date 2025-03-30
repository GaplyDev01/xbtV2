import * as React from "react";
import { cn } from "../../utils/cn";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, checked, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(event.target.checked);
    };

    return (
      <div className="relative inline-block">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            "h-4 w-4 rounded border border-theme-border transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent",
            checked ? "bg-theme-accent border-transparent" : "bg-theme-bg",
            className
          )}
        >
          {checked && (
            <Check className="h-3 w-3 text-theme-bg stroke-[3]" />
          )}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };