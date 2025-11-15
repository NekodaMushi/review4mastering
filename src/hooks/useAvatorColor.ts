const AVATAR_COLORS = [
  "#219F94", "#C1DEAE", "#313552", "#2EB086", "#96CEB4",
  "#FFEEAD", "#D9534F", "#FFAD60", "#CCD1E4", "#FE7E6D",
];

export function useAvatarColor(id: string): string {
  const hash = id.split("").reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
