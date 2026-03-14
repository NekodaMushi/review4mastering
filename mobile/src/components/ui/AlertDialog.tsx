import React, { createContext, useCallback, useContext } from "react";
import { Modal, Pressable, View, Text } from "react-native";

import { cn } from "@/lib/utils";
import { Button } from "./Button";

const noop = () => {};

type AlertDialogContextValue = {
  onOpenChange: (open: boolean) => void;
};

const AlertDialogContext = createContext<AlertDialogContextValue>({
  onOpenChange: noop,
});

type AlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <AlertDialogContext.Provider value={{ onOpenChange }}>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/60"
          onPress={handleClose}
        >
          <Pressable onPress={noop}>{children}</Pressable>
        </Pressable>
      </Modal>
    </AlertDialogContext.Provider>
  );
}

type AlertDialogContentProps = {
  className?: string;
  children: React.ReactNode;
};

function AlertDialogContent({ className, children }: AlertDialogContentProps) {
  return (
    <View
      className={cn(
        "w-80 gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-6",
        className
      )}
    >
      {children}
    </View>
  );
}

type AlertDialogHeaderProps = {
  className?: string;
  children: React.ReactNode;
};

function AlertDialogHeader({ className, children }: AlertDialogHeaderProps) {
  return <View className={cn("gap-2", className)}>{children}</View>;
}

type AlertDialogFooterProps = {
  className?: string;
  children: React.ReactNode;
};

function AlertDialogFooter({ className, children }: AlertDialogFooterProps) {
  return (
    <View className={cn("flex-row justify-end gap-2", className)}>
      {children}
    </View>
  );
}

type AlertDialogTitleProps = {
  className?: string;
  children: React.ReactNode;
};

function AlertDialogTitle({ className, children }: AlertDialogTitleProps) {
  return (
    <Text className={cn("text-lg font-semibold text-neutral-100", className)}>
      {children}
    </Text>
  );
}

type AlertDialogDescriptionProps = {
  className?: string;
  children: React.ReactNode;
};

function AlertDialogDescription({
  className,
  children,
}: AlertDialogDescriptionProps) {
  return (
    <Text className={cn("text-sm text-neutral-400", className)}>
      {children}
    </Text>
  );
}

type AlertDialogButtonProps = {
  className?: string;
  children: React.ReactNode;
  onPress?: () => void;
};

function AlertDialogAction({
  className,
  children,
  onPress,
}: AlertDialogButtonProps) {
  return (
    <Button variant="default" className={className} onPress={onPress}>
      {children}
    </Button>
  );
}

function AlertDialogCancel({
  className,
  children,
  onPress,
}: AlertDialogButtonProps) {
  const { onOpenChange } = useContext(AlertDialogContext);

  const handlePress = useCallback(() => {
    onOpenChange(false);
    onPress?.();
  }, [onOpenChange, onPress]);

  return (
    <Button variant="outline" className={className} onPress={handlePress}>
      {children}
    </Button>
  );
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
