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
      await animateOut("left");
      onArchive?.(note.id);
    } else if (info.offset.x > swipeThreshold) {
      await animateOut("right");
      onDelete?.(note.id);
    } else {
      await animate(x, 0, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
    }
  };

  const handleClick = () => {
    if (!isDraggingRef.current) {
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
    <div ref={containerRef} className="relative overflow-hidden rounded-lg">
      <motion.div
        style={{ backgroundColor, opacity: backgroundOpacity }}
        className="absolute inset-0 flex items-center justify-between px-8"
      >
        <Archive className="text-white" size={28} />
        <Trash2 className="text-white" size={28} />
      </motion.div>

      <motion.div
        drag="x"
        dragElastic={0.2}
        dragMomentum={false}
        style={{ x, opacity, height }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        className="cursor-grab active:cursor-grabbing relative z-10"
      >
        <NoteCard note={note} />
      </motion.div>
    </div>
  );
}
