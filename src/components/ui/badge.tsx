import React from "react";
import { cn } from "../../utils/cn";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";

type BadgeProps = {
  label: string;
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  size?: "small" | "medium" | "large";
  icon?: React.ReactNode;
  onClick?: () => void;
  removable?: boolean;
  className?: string;
  maxWidth?: string | number;
  appearance?: "solid" | "outline" | "subtle";
  onRemove?: () => void;
  isLoading?: boolean;
};

export const Badge = ({
  label,
  variant = "primary",
  size = "medium",
  icon,
  onClick,
  removable = false,
  className,
  maxWidth,
  appearance = "solid",
  onRemove,
  isLoading = false,
}: BadgeProps) => {
  const variantStyles = {
    primary: {
      solid: "bg-theme-accent text-theme-bg",
      outline: "border-2 border-theme-accent text-theme-accent",
      subtle: "bg-theme-accent/20 text-theme-accent",
    },
    secondary: {
      solid: "bg-theme-bg-secondary text-theme-text-primary",
      outline: "border-2 border-theme-bg-secondary text-theme-text-primary",
      subtle: "bg-theme-bg-secondary/20 text-theme-text-primary",
    },
    success: {
      solid: "bg-green-600 text-white",
      outline: "border-2 border-green-600 text-green-600",
      subtle: "bg-green-100 text-green-600",
    },
    warning: {
      solid: "bg-yellow-500 text-white",
      outline: "border-2 border-yellow-500 text-yellow-500",
      subtle: "bg-yellow-100 text-yellow-500",
    },
    error: {
      solid: "bg-red-600 text-white",
      outline: "border-2 border-red-600 text-red-600",
      subtle: "bg-red-100 text-red-600",
    },
  };

  const sizeStyles = {
    small: "text-xs px-2 py-1",
    medium: "text-sm px-3 py-2",
    large: "text-base px-4 py-3",
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.4, ease: "easeInOut", type: "spring" }}
      whileHover={{
        scale: onClick ? 1.05 : 1,
        backgroundColor: onClick ? "rgb(var(--theme-accent) / 0.8)" : undefined,
        transition: {
          duration: 0.2,
          ease: "easeInOut",
          type: "spring",
        },
      }}
      onClick={handleClick}
      style={{ maxWidth }}
      className={cn(
        "rounded-xl font-medium shadow-[0_0_20px_rgba(0,0,0,0.2)] inline-flex items-center gap-2 backdrop-blur-sm",
        variantStyles[variant][appearance],
        sizeStyles[size],
        onClick && "cursor-pointer",
        className
      )}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            ease: "linear",
            repeat: Infinity,
          }}
          className="flex-shrink-0"
        >
          <Loader2 className="h-4 w-4" />
        </motion.div>
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      <span className="truncate">{label}</span>
      {removable && (
        <motion.button
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          whileHover={{
            scale: 1.1,
            opacity: 1,
            transition: {
              duration: 0.2,
              ease: "easeInOut",
              type: "spring",
            },
          }}
          className="p-1 opacity-60 hover:opacity-100 bg-theme-bg/50 hover:bg-theme-bg/70 rounded-md flex items-center justify-center"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </motion.button>
      )}
    </motion.div>
  );
};