import { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Bell, Copy, Check, X, AlertCircle } from "lucide-react-native";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

interface NotificationData {
  userId: string;
  topic: string;
  username: string;
  password: string;
  server: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [data, setData] = useState<NotificationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [testSent, setTestSent] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const testTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(copyTimerRef.current);
      clearTimeout(testTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(false);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/notifications/subscribe-link`,
          { credentials: "include" }
        );

        if (cancelled) return;

        if (!response.ok) {
          setError(true);
          return;
        }

        const json = (await response.json()) as NotificationData;
        setData(json);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleCopy = async (text: string, field: string) => {
    await Clipboard.setStringAsync(text);
    setCopiedField(field);
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTestNotification = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/test`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) return;

      setTestSent(true);
      clearTimeout(testTimerRef.current);
      testTimerRef.current = setTimeout(() => setTestSent(false), 3000);
    } catch {
      // silent fail on network errors
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/60 px-4"
        onPress={onClose}
      >
        <Pressable onPress={() => {}}>
          <View className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View className="mb-6 flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-white">
                  Setup Notifications
                </Text>
                <Pressable
                  onPress={onClose}
                  accessibilityLabel="Close panel"
                  className="p-1"
                >
                  <X size={24} color="#737373" />
                </Pressable>
              </View>

              {loading ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" color="#f59e0b" />
                  <Text className="mt-3 text-neutral-500">
                    Loading setup credentials...
                  </Text>
                </View>
              ) : error || !data ? (
                <View className="items-center py-8">
                  <Text className="text-neutral-500">
                    Error loading setup credentials
                  </Text>
                </View>
              ) : (
                <View className="gap-6">
                  {/* Warning Box */}
                  <View className="flex-row gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                    <AlertCircle size={20} color="#fbbf24" />
                    <Text className="flex-1 text-sm text-amber-400/80">
                      Follow these steps to set up push notifications in the
                      ntfy Android app.
                    </Text>
                  </View>

                  {/* Step 1 */}
                  <StepBlock step={1}>
                    <Text className="font-semibold text-white">
                      Open ntfy App
                    </Text>
                    <Text className="mt-1 text-sm text-neutral-400">
                      Launch the ntfy Android app on your device.
                    </Text>
                  </StepBlock>

                  {/* Step 2 */}
                  <StepBlock step={2}>
                    <Text className="font-semibold text-white">
                      Go to Settings
                    </Text>
                    <Text className="mt-1 text-sm text-neutral-400">
                      {"Tap the menu button (\u22EE) \u2192 "}
                      <Text className="font-bold text-neutral-300">
                        Settings
                      </Text>
                      {" \u2192 "}
                      <Text className="font-bold text-neutral-300">
                        Manage Users
                      </Text>
                    </Text>
                  </StepBlock>

                  {/* Step 3 — Credentials */}
                  <StepBlock step={3}>
                    <Text className="font-semibold text-white">
                      Add Credentials
                    </Text>
                    <Text className="mb-3 mt-1 text-xs text-neutral-400">
                      Copy & paste these credentials:
                    </Text>

                    <View className="gap-2 rounded-lg border border-neutral-700 bg-neutral-800/80 p-4">
                      <CopyableField
                        label="Server"
                        value={data.server}
                        field="server"
                        copiedField={copiedField}
                        onCopy={handleCopy}
                      />
                      <CopyableField
                        label="Username"
                        value={data.username}
                        field="username"
                        copiedField={copiedField}
                        onCopy={handleCopy}
                      />
                      <CopyableField
                        label="Password"
                        value={data.password}
                        field="password"
                        copiedField={copiedField}
                        onCopy={handleCopy}
                      />
                    </View>
                  </StepBlock>

                  {/* Step 4 — Topic */}
                  <StepBlock step={4}>
                    <Text className="font-semibold text-white">
                      Subscribe to Topic
                    </Text>
                    <Text className="mb-2 mt-1 text-sm text-neutral-400">
                      {'After adding the user, tap "+" \u2192 paste this topic name:'}
                    </Text>
                    <CopyableField
                      value={data.topic}
                      field="topic"
                      copiedField={copiedField}
                      onCopy={handleCopy}
                    />
                  </StepBlock>

                  {/* Step 5 — Done */}
                  <View className="rounded-lg border-l-2 border-emerald-500/50 bg-emerald-500/10 p-3">
                    <View className="flex-row items-center gap-2">
                      <View className="h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                        <Text className="text-xs font-bold text-neutral-950">
                          {"\u2713"}
                        </Text>
                      </View>
                      <Text className="font-semibold text-white">
                        All Set!
                      </Text>
                    </View>
                    <Text className="mt-1 text-sm text-neutral-400">
                      {"You'll now receive notifications before each review session."}
                    </Text>
                  </View>

                  {/* Test notification */}
                  <Pressable
                    onPress={handleTestNotification}
                    className="flex-row items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 active:opacity-80"
                  >
                    <Bell size={16} color="#f59e0b" />
                    <Text className="text-sm font-medium text-amber-400">
                      {testSent
                        ? "Test notification sent!"
                        : "Send Test Notification"}
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Close button */}
              <Pressable
                onPress={onClose}
                className="mt-8 rounded-lg border border-neutral-700 px-4 py-3 active:bg-neutral-800"
              >
                <Text className="text-center font-medium text-neutral-400">
                  Close
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Internal helper components                                         */
/* ------------------------------------------------------------------ */

function StepBlock({
  step,
  children,
}: {
  step: number;
  children: React.ReactNode;
}) {
  return (
    <View className="border-l-2 border-amber-500/50 pl-4">
      <View className="mb-2 flex-row items-center gap-2">
        <View className="h-6 w-6 items-center justify-center rounded-full bg-amber-500">
          <Text className="text-xs font-bold text-neutral-950">{step}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function CopyableField({
  label,
  value,
  field,
  copiedField,
  onCopy,
}: {
  label?: string;
  value: string;
  field: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}) {
  return (
    <View>
      {label ? (
        <Text className="mb-1 text-xs font-semibold text-neutral-400">
          {label}
        </Text>
      ) : null}
      <View className="flex-row items-center gap-2">
        <View className="flex-1 rounded border border-neutral-700 bg-neutral-950 px-2 py-1">
          <Text className="font-mono text-xs text-white">{value}</Text>
        </View>
        <Pressable
          onPress={() => onCopy(value, field)}
          className="rounded p-1.5 active:bg-neutral-700"
          accessibilityLabel={`Copy ${label ?? field}`}
        >
          {copiedField === field ? (
            <Check size={16} color="#34d399" />
          ) : (
            <Copy size={16} color="#737373" />
          )}
        </Pressable>
      </View>
    </View>
  );
}
