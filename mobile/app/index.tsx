import { useRouter } from "expo-router";
import { View, Text, ScrollView, Pressable } from "react-native";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";

const stages = [
  { label: "10 min", color: "#ef4444" },
  { label: "1 day", color: "#f97316" },
  { label: "7 days", color: "#eab308" },
  { label: "1 month", color: "#84cc16" },
  { label: "3 months", color: "#a855f7" },
  { label: "1 year", color: "#6366f1" },
  { label: "2 years", color: "#14b8a6" },
  { label: "5 years", color: "#22c55e" },
  { label: "Mastered", color: "#fbbf24" },
];

export default function LandingScreen() {
  const router = useRouter();

  const lineHeight = useSharedValue(0);

  useEffect(() => {
    lineHeight.value = withDelay(800, withTiming(1, { duration: 1200 }));
  }, [lineHeight]);

  const animatedLineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: lineHeight.value }],
  }));

  return (
    <ScrollView
      className="flex-1 bg-neutral-950"
      contentContainerClassName="flex-grow items-center justify-center px-6 py-20"
    >
      {/* Overline */}
      <Animated.Text
        entering={FadeInDown.delay(100).duration(600)}
        className="text-sm tracking-widest uppercase text-amber-400/80 font-medium mb-6"
      >
        Spaced Repetition System
      </Animated.Text>

      {/* Headline */}
      <Animated.View entering={FadeInDown.delay(200).duration(700)}>
        <Text className="text-4xl font-bold text-center text-white leading-tight tracking-tight">
          Knowledge that
        </Text>
        <Text className="text-4xl font-bold text-center text-amber-400 leading-tight tracking-tight">
          lasts forever
        </Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.Text
        entering={FadeInDown.delay(350).duration(700)}
        className="mt-6 text-neutral-400 text-base text-center leading-relaxed max-w-lg"
      >
        Review what you learn on a scientifically-proven schedule. From 10
        minutes to 5 years — until it's truly yours.
      </Animated.Text>

      {/* Vertical Timeline */}
      <Animated.View
        entering={FadeInDown.delay(500).duration(800)}
        className="mt-16 self-center"
      >
        <View className="relative ml-1">
          {/* Background track line */}
          <View className="absolute left-[4px] top-3 bottom-3 w-px bg-neutral-800" />

          {/* Animated gradient line */}
          <Animated.View
            style={[
              {
                position: "absolute",
                left: 4,
                top: 12,
                bottom: 12,
                width: 1,
              },
              animatedLineStyle,
            ]}
          >
            <LinearGradient
              colors={["rgba(245,158,11,0.8)", "rgba(16,185,129,0.6)", "rgba(245,158,11,0.8)"]}
              className="flex-1"
            />
          </Animated.View>

          {/* Stage items */}
          {stages.map((stage, i) => (
            <Animated.View
              key={stage.label}
              entering={FadeIn.delay(800 + i * 80).duration(350)}
              className="flex-row items-center gap-4 py-2"
            >
              <View
                style={{ backgroundColor: stage.color }}
                className="w-2.5 h-2.5 rounded-full shrink-0"
              />
              <Text className="text-sm text-neutral-400 font-medium">
                {stage.label}
              </Text>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* CTA Buttons */}
      <Animated.View
        entering={FadeInDown.delay(1200).duration(600)}
        className="mt-14 flex-row gap-4"
      >
        <Pressable
          onPress={() => router.push("/(auth)/sign-up")}
          className="active:opacity-80"
        >
          <LinearGradient
            colors={["#fbbf24", "#f59e0b"]}
            className="px-8 py-3 rounded-lg shadow-lg"
          >
            <Text className="text-neutral-950 font-semibold text-sm tracking-wide">
              Sign Up
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(auth)/sign-in")}
          className="border border-neutral-700 px-8 py-3 rounded-lg active:bg-neutral-900"
        >
          <Text className="text-neutral-300 font-medium text-sm tracking-wide">
            Login
          </Text>
        </Pressable>
      </Animated.View>

      {/* Footer */}
      <Animated.Text
        entering={FadeIn.delay(1500).duration(600)}
        className="mt-16 text-xs text-neutral-600 tracking-wide text-center"
      >
        Built on the science of spaced repetition
      </Animated.Text>
    </ScrollView>
  );
}
