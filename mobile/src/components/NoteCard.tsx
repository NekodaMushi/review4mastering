import React from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { Link2 } from "lucide-react-native";

import { useAvatarColor } from "@/lib/hooks/useAvatarColor";
import { getReviewStatus } from "@/lib/utils/review";
import type { NoteRecord } from "@/types/note";

interface NoteCardProps {
  note: NoteRecord;
  archived?: boolean;
}

export function NoteCard({ note, archived = false }: NoteCardProps) {
  const reviewStatus = getReviewStatus(note.next_review, note.current_stage);
  const avatarColor = useAvatarColor(note.id);
  const avatarLetter = note.name.charAt(0).toUpperCase();
  const archivedAt = note.archived_at ? new Date(note.archived_at) : null;

  const badgeBg = archived ? "#404040" : reviewStatus.bgColor;
  const badgeText = archived ? "#e5e5e5" : reviewStatus.textColor;
  const badgeLabel = archived ? "Archived" : reviewStatus.label;

  const secondaryDate = archivedAt
    ? `Archived: ${archivedAt.toLocaleDateString()}`
    : reviewStatus.dateText;

  const handleLinkPress = () => {
    if (note.link) {
      Linking.openURL(note.link);
    }
  };

  return (
    <View className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <View className="flex-row gap-3 mb-3">
        {/* Avatar */}
        <View
          className="h-10 w-10 rounded-full items-center justify-center"
          style={{ backgroundColor: avatarColor }}
        >
          <Text className="text-white font-bold">{avatarLetter}</Text>
        </View>

        <View className="flex-1 min-w-0">
          {/* Name + badge row */}
          <View className="flex-row justify-between items-start gap-3 mb-2">
            <Text
              className="text-lg font-bold text-white flex-1"
              numberOfLines={1}
            >
              {note.name}
            </Text>
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: badgeBg }}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: badgeText }}
              >
                {badgeLabel}
              </Text>
            </View>
          </View>

          {/* Text preview */}
          <Text className="text-neutral-400 text-sm mb-3" numberOfLines={2}>
            {note.text}
          </Text>

          {/* Link */}
          {note.link ? (
            <Pressable onPress={handleLinkPress} className="flex-row items-center gap-1 mb-3">
              <Link2 size={14} color="#fbbf24" />
              <Text
                className="text-amber-400/80 text-sm"
                numberOfLines={1}
              >
                {note.link}
              </Text>
            </Pressable>
          ) : null}

          {/* Dates */}
          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-neutral-500">
              Created: {new Date(note.created_at!).toLocaleDateString()}
            </Text>
            <Text
              className={`text-xs ${
                !archived && reviewStatus.isDue
                  ? "text-amber-400 font-semibold"
                  : "text-neutral-500"
              }`}
            >
              {secondaryDate}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
