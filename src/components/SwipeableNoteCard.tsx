"use client";

import { useRef, useEffect, useState } from "react";
import { note } from "@prisma/client";
import {
  motion,
  PanInfo,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { NoteCard } from "./NoteCard";
import { Trash2, Archive } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SwipeableNoteCardProps {
  note: note;
  onDelete?: (noteId: string) => void;
  onArchive?: (noteId: string) => void;
  onClick?: (note: note) => void;
}

export function SwipeableNoteCard({
  note,
  onDelete,
  onArchive,
  onClick,
}: SwipeableNoteCardProps) {
  const x = useMotionValue(0);
  const opacity = useMotionValue(1);
  const height = useMotionValue("auto");
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "delete" | "archive" | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  const backgroundColor = useTransform(
    x,
    [-100, 0, 100],
    ["rgb(239, 68, 68)", "rgb(255, 255, 255)", "rgb(34, 197, 94)"]
  );

  const backgroundOpacity = useTransform(
    x,
    [
      -containerWidth * 0.9,
      -containerWidth * 0.8,
      0,
      containerWidth * 0.8,
      containerWidth * 0.9,
    ],
    [0, 1, 1, 1, 0]
  );

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = async (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    isDraggingRef.current = false;

    const swipeThreshold = containerWidth * 0.45;
    const swipeVelocity = 40;

    const isFlick = Math.abs(info.velocity.x) > swipeVelocity;
    const isSwipe = Math.abs(info.offset.x) > swipeThreshold || isFlick;

    if (!isSwipe) {
      await animate(x, 0, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
      return;
    }

    if (info.offset.x < -swipeThreshold) {
      setPendingAction("delete");
      setIsDeleteDialogOpen(true);
      await animate(x, 0, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
    } else if (info.offset.x > swipeThreshold) {
      await animateOut("right");
      onArchive?.(note.id);
    } else {
      await animate(x, 0, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setIsDeleteDialogOpen(false);

    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      await animateOut("left");
      onDelete?.(note.id);
      setPendingAction(null);
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Error during deletion");
      setPendingAction(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setPendingAction(null);
  };

  const handleClick = () => {
    if (!isDraggingRef.current && !isDeleting) {
      onClick?.(note);
    }
  };

  const animateOut = async (direction: "left" | "right") => {
    const targetX =
      direction === "left" ? -containerWidth * 1.5 : containerWidth * 1.5;

    await Promise.all([
      animate(x, targetX, {
        type: "spring",
        stiffness: 38,
        damping: 20,
      }),
      animate(opacity, 0, {
        duration: 0.2,
      }),
    ]);

    height.set("0px");
  };

  return (
    <>
      <div ref={containerRef} className="relative overflow-hidden rounded-lg">
        {!isDeleting && (
          <motion.div
            style={{ backgroundColor, opacity: backgroundOpacity }}
            className="absolute inset-0 flex items-center justify-between px-8"
          >
            <Archive className="text-white" size={28} />
            <Trash2 className="text-white" size={28} />
          </motion.div>
        )}

        <motion.div
          drag={isDeleting ? false : "x"}
          dragElastic={0.2}
          dragMomentum={false}
          style={{ x, opacity, height }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onClick={handleClick}
          className={
            isDeleting
              ? "relative z-10"
              : "cursor-grab active:cursor-grabbing relative z-10"
          }
        >
          {isDeleting ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                {/* Avatar skeleton */}
                <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />

                {/* Content skeleton */}
                <div className="flex-1 space-y-3">
                  {/* Title */}
                  <Skeleton className="h-5 w-2/3" />

                  {/* Description */}
                  <Skeleton className="h-4 w-full" />

                  {/* Date info */}
                  <div className="flex items-center gap-4 pt-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>

                {/* Badge skeleton */}
                <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
              </div>

              {/* Link skeleton (if present) */}
              {note.link && (
                <div className="mt-3 pt-3 border-t">
                  <Skeleton className="h-4 w-48" />
                </div>
              )}
            </div>
          ) : (
            <NoteCard note={note} />
          )}
        </motion.div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the note. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
