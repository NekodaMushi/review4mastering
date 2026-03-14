import React from "react";
import { View } from "react-native";

import { cn } from "@/lib/utils";

type SeparatorProps = {
  className?: string;
  orientation?: "horizontal" | "vertical";
};

function Separator({ className, orientation = "horizontal" }: SeparatorProps) {
  return (
    <View
      className={cn(
        "bg-neutral-800",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
    />
  );
}

export { Separator };
