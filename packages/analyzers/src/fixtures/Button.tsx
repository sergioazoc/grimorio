import React from "react";
import { cva } from "class-variance-authority";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  children: React.ReactNode;
}

const buttonVariants = cva("inline-flex items-center justify-center rounded-md font-medium", {
  variants: {
    variant: {
      primary: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
      ghost: "hover:bg-gray-100",
    },
    size: {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export function Button({ variant, size, disabled, children }: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size })}
      disabled={disabled}
      role="button"
      aria-disabled={disabled}
      tabIndex={0}
      onKeyDown={(_e) => {}}
    >
      {children}
    </button>
  );
}

export default Button;
