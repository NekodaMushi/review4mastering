import React, { useCallback, useState } from "react";
import { Alert, Pressable, Text, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Archive, Trash2 } from "lucide-react-native";

import { NoteCard } from "./NoteCard";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import type { NoteRecord } from "@/types/note";
import { API_BASE_URL } from "@/lib/constants/api";

const SPRING_CONFIG = { damping: 30, stiffness: 300 };

const SELECTION_COLORS = {
  delete: {
    background: "bg-red-500/10",
    border: "border-red-500/30",
    borderSeparator: "border-red-500/20",
  },
  archive: {
    background: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    borderSeparator: "border-emerald-500/20",
  },
  default: {
    background: "bg-amber-500/10",
    border: "border-amber-500/30",
    borderSeparator: "border-amber-500/20",
  },
} as const;

interface SwipeableNoteCardProps {
  note: NoteRecord;
  onDelete?: (noteId: string) => void;
  onArchive?: (noteId: string) => Promise<void> | void;
  onClick?: (note: NoteRecord) => void;
  selectionMode?: "delete" | "archive" | null;
  isSelected?: boolean;
  allowArchive?: boolean;
  archived?: boolean;
}

export function SwipeableNoteCard({
  note,
  onDelete,
  onArchive,
  onClick,
  selectionMode = null,
  isSelected = false,
  allowArchive = true,
  archived = false,
}: SwipeableNoteCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const swipeThreshold = screenWidth * 0.45;

  const openDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const triggerArchive = useCallback(async () => {
    try {
      await onArchive?.(note.id);
      // Success — animate out
      translateX.value = withTiming(screenWidth * 1.5, { duration: 300 });
      cardOpacity.value = withTiming(0, { duration: 200 });
    } catch {
      // Failed — spring back to original position
      translateX.value = withSpring(0, SPRING_CONFIG);
      cardOpacity.value = withTiming(1);
    }
  }, [note.id, onArchive, translateX, cardOpacity, screenWidth]);

  const panGesture = Gesture.Pan()
    .enabled(!isDeleting && !selectionMode)
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // Clamp right-swipe if archive not allowed
      if (!allowArchive && event.translationX > 0) {
        translateX.value = 0;
        return;
      }
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const offset = event.translationX;
      const isSwipe = Math.abs(offset) > swipeThreshold;

      if (!isSwipe) {
        translateX.value = withSpring(0, SPRING_CONFIG);
        return;
      }

      if (offset < -swipeThreshold) {
        // Swipe left -> delete confirmation
        translateX.value = withSpring(0, SPRING_CONFIG);
        runOnJS(openDeleteDialog)();
      } else if (offset > swipeThreshold && allowArchive) {
        // Swipe right -> archive (hold position, animate in JS after success/failure)
        runOnJS(triggerArchive)();
      } else {
        translateX.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: cardOpacity.value,
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      translateX.value,
      [-100, 0, 100],
      allowArchive
        ? ["rgb(239, 68, 68)", "rgb(23, 23, 23)", "rgb(34, 197, 94)"]
        : ["rgb(239, 68, 68)", "rgb(23, 23, 23)", "rgb(23, 23, 23)"]
    );

    const bgOpacity = interpolate(
      translateX.value,
      [
        -screenWidth * 0.9,
        -screenWidth * 0.8,
        0,
        screenWidth * 0.8,
        screenWidth * 0.9,
      ],
      allowArchive ? [0, 1, 1, 1, 0] : [0, 1, 1, 0, 0]
    );

    return {
      backgroundColor: bgColor,
      opacity: bgOpacity,
    };
  });

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setIsDeleteDialogOpen(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/notes/${note.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      // Animate out left
      translateX.value = withTiming(-screenWidth * 1.5, { duration: 300 });
      cardOpacity.value = withTiming(0, { duration: 200 });

      onDelete?.(note.id);
    } catch (error) {
      console.error("Error deleting note:", error);
      Alert.alert("Error", "Failed to delete the note.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  const handlePress = () => {
    if (!isDeleting) {
      onClick?.(note);
    }
  };

  const shouldShowSkeleton = isSelected && selectionMode;

  const colors = SELECTION_COLORS[selectionMode ?? "default"];

  const renderSkeletonContent = (
    containerClass: string,
    separatorClass: string
  ) => (
    <View className={`${containerClass} rounded-lg overflow-hidden`}>
      <View className="p-6">
        <View className="flex-row items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <View className="flex-1 min-w-0 gap-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <View className="flex-row items-center gap-4 pt-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-40" />
            </View>
          </View>
          <Skeleton className="h-6 w-16 rounded-full" />
        </View>
        {note.link ? (
          <View className={`mt-3 pt-3 border-t ${separatorClass}`}>
            <Skeleton className="h-4 w-48" />
          </View>
        ) : null}
      </View>
    </View>
  );

  const renderContent = () => {
    if (shouldShowSkeleton) {
      return renderSkeletonContent(
        `${colors.background} border-2 ${colors.border}`,
        colors.borderSeparator
      );
    }

    if (isDeleting) {
      return renderSkeletonContent(
        "border border-neutral-800 bg-neutral-900/80",
        "border-neutral-800"
      );
    }

    return (
      <View className="relative">
        {selectionMode && !isSelected ? (
          <View className="absolute inset-0 bg-neutral-950 opacity-40 rounded-lg z-10" />
        ) : null}
        <NoteCard note={note} archived={archived} />
      </View>
    );
  };

  return (
    <>
      <View className="relative overflow-hidden rounded-lg">
        {/* Swipe background indicators */}
        {!isDeleting && !selectionMode ? (
          <Animated.View
            style={backgroundAnimatedStyle}
            className={`absolute inset-0 flex-row items-center px-8 ${
              allowArchive ? "justify-between" : "justify-end"
            }`}
          >
            {allowArchive ? <Archive size={28} color="white" /> : null}
            <Trash2 size={28} color="white" />
          </Animated.View>
        ) : null}

        {/* Swipeable card */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={cardAnimatedStyle}>
            <Pressable onPress={handlePress}>
              {renderContent()}
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the note. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={handleCancelDelete} disabled={isDeleting}>
              <Text className="text-neutral-300 text-sm font-medium">
                Cancel
              </Text>
            </AlertDialogCancel>
            <AlertDialogAction
              onPress={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600"
            >
              <Text className="text-white text-sm font-medium">
                {isDeleting ? "Deleting..." : "Delete"}
              </Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
