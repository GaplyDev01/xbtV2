import * as React from "react";

type AlertVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const getAlertClassNames = (variant: AlertVariant = 'default', className = '') => {
  const baseClasses = "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-theme-text-secondary";
  
  const variantClasses = {
    default: "bg-theme-bg border-theme-border text-theme-text",
    destructive: "border-red-500/50 text-red-500 dark:border-red-500 [&>svg]:text-red-500",
    success: "border-green-500/50 text-green-500 dark:border-green-500 [&>svg]:text-green-500",
    warning: "border-yellow-500/50 text-yellow-500 dark:border-yellow-500 [&>svg]:text-yellow-500",
    info: "border-theme-accent/50 text-theme-accent [&>svg]:text-theme-accent",
  };
  
  return `${baseClasses} ${variantClasses[variant]} ${className}`;
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>
(({ className = '', variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={getAlertClassNames(variant, className)}
    {...props}
  />
));

Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
