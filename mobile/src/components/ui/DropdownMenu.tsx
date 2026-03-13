import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { cn } from "@/lib/utils";
import { Separator } from "./Separator";

const noop = () => {};

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DropdownMenuContext = createContext<DropdownMenuContextValue>({
  open: false,
  setOpen: noop,
});

type DropdownMenuProps = {
  children: React.ReactNode;
};

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <DropdownMenuContext.Provider value={value}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

type DropdownMenuTriggerProps = {
  children: React.ReactNode;
  className?: string;
};

function DropdownMenuTrigger({
  children,
  className,
}: DropdownMenuTriggerProps) {
  const { setOpen } = useContext(DropdownMenuContext);
  const handlePress = useCallback(() => setOpen(true), [setOpen]);

  return (
    <Pressable className={className} onPress={handlePress}>
      {children}
    </Pressable>
  );
}

type DropdownMenuContentProps = {
  children: React.ReactNode;
  className?: string;
};

function DropdownMenuContent({
  children,
  className,
}: DropdownMenuContentProps) {
  const { open, setOpen } = useContext(DropdownMenuContext);
  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable className="flex-1" onPress={handleClose}>
        <View className="flex-1 items-end pt-16 pr-4">
          <Pressable onPress={noop}>
            <View
              className={cn(
                "min-w-[180px] rounded-md border border-neutral-800 bg-neutral-900 p-1",
                className
              )}
            >
              {children}
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

type DropdownMenuItemProps = {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
};

function DropdownMenuItem({
  children,
  className,
  onPress,
  icon,
  variant = "default",
}: DropdownMenuItemProps) {
  const { setOpen } = useContext(DropdownMenuContext);

  const handlePress = useCallback(() => {
    onPress?.();
    setOpen(false);
  }, [onPress, setOpen]);

  return (
    <Pressable
      className={cn(
        "flex-row items-center gap-2 rounded-sm px-2 py-2 active:bg-neutral-800",
        className
      )}
      onPress={handlePress}
    >
      {icon}
      {typeof children === "string" ? (
        <Text
          className={cn(
            "text-sm",
            variant === "destructive" ? "text-red-500" : "text-neutral-100"
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

type DropdownMenuSeparatorProps = {
  className?: string;
};

function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return <Separator className={cn("-mx-1 my-1", className)} />;
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
