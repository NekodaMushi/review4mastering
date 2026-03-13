import React from "react";
import { Pressable, Text, type PressableProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-md",
  {
    variants: {
      variant: {
        default: "bg-amber-500 active:bg-amber-600",
        destructive: "bg-red-600 active:bg-red-700",
        outline: "border border-neutral-700 bg-transparent active:bg-neutral-800",
        secondary: "bg-neutral-700 active:bg-neutral-600",
        ghost: "bg-transparent active:bg-neutral-800",
        link: "bg-transparent",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-6",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva("text-sm font-medium", {
  variants: {
    variant: {
      default: "text-neutral-950",
      destructive: "text-white",
      outline: "text-neutral-100",
      secondary: "text-neutral-100",
      ghost: "text-neutral-100",
      link: "text-amber-500 underline",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    className?: string;
    textClassName?: string;
    children: React.ReactNode;
  };

function Button({
  className,
  textClassName,
  variant,
  size,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(
        buttonVariants({ variant, size }),
        disabled && "opacity-50",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className={cn(buttonTextVariants({ variant }), textClassName)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export { Button, buttonVariants, buttonTextVariants };
