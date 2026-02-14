"use client";

import { useEffect, useState } from "react";
import { X, Copy, Check, AlertCircle } from "lucide-react";
import { safeFetchWithRetry } from "@/lib/utils/fetch-utils";

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
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      const result = await safeFetchWithRetry<NotificationData>(
        "/api/notifications/subscribe-link",
        { credentials: "include", retries: 3 }
      );

      if (result.error) {
        console.error("Setup failed:", result.error);
      } else {
        setData(result.data);
      }

      setLoading(false);
    };

    fetchData();
  }, [isOpen]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-white">
            Setup Notifications
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors"
            aria-label="Close panel"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-neutral-500">Loading setup credentials...</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Warning Box */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3">
              <AlertCircle
                size={20}
                className="text-amber-400 shrink-0 mt-0.5"
              />
              <p className="text-sm text-amber-400/80">
                Follow these steps to set up push notifications in the ntfy
                Android app.
              </p>
            </div>

            {/* Step 1 */}
            <div className="border-l-2 border-amber-500/50 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h3 className="font-semibold text-white">Open ntfy App</h3>
              </div>
              <p className="text-sm text-neutral-400">
                Launch the ntfy Android app on your device.
              </p>
            </div>

            {/* Step 2 */}
            <div className="border-l-2 border-amber-500/50 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <h3 className="font-semibold text-white">Go to Settings</h3>
              </div>
              <p className="text-sm text-neutral-400 mb-2">
                Tap the menu button (&vellip;) &rarr; <strong>Settings</strong> &rarr;{" "}
                <strong>Manage Users</strong>
              </p>
            </div>

            {/* Step 3 */}
            <div className="border-l-2 border-amber-500/50 pl-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <h3 className="font-semibold text-white">Add Credentials</h3>
              </div>

              <p className="text-xs text-neutral-400 font-medium mb-3">
                Copy &amp; paste these credentials:
              </p>

              <div className="space-y-2 bg-neutral-800/80 p-4 rounded-lg border border-neutral-700">
                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1">
                    Server
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="text-white flex-1 bg-neutral-950 px-2 py-1 rounded text-xs font-mono border border-neutral-700">
                      {data.server}
                    </code>
                    <button
                      onClick={() => handleCopy(data.server, "server")}
                      className="p-1.5 hover:bg-neutral-700 rounded transition"
                      title="Copy"
                    >
                      {copiedField === "server" ? (
                        <Check size={16} className="text-emerald-400" />
                      ) : (
                        <Copy size={16} className="text-neutral-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1">
                    Username
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="text-white flex-1 bg-neutral-950 px-2 py-1 rounded text-xs font-mono border border-neutral-700">
                      {data.username}
                    </code>
                    <button
                      onClick={() => handleCopy(data.username, "username")}
                      className="p-1.5 hover:bg-neutral-700 rounded transition"
                      title="Copy"
                    >
                      {copiedField === "username" ? (
                        <Check size={16} className="text-emerald-400" />
                      ) : (
                        <Copy size={16} className="text-neutral-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1">
                    Password
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="text-white flex-1 bg-neutral-950 px-2 py-1 rounded text-xs font-mono border border-neutral-700 break-all">
                      {data.password}
                    </code>
                    <button
                      onClick={() => handleCopy(data.password, "password")}
                      className="p-1.5 hover:bg-neutral-700 rounded transition shrink-0"
                      title="Copy"
                    >
                      {copiedField === "password" ? (
                        <Check size={16} className="text-emerald-400" />
                      ) : (
                        <Copy size={16} className="text-neutral-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="border-l-2 border-amber-500/50 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <h3 className="font-semibold text-white">
                  Subscribe to Topic
                </h3>
              </div>
              <p className="text-sm text-neutral-400 mb-2">
                After adding the user, tap &quot;+&quot; &rarr; paste this topic
                name:
              </p>
              <div className="flex items-center gap-2">
                <code className="text-white flex-1 bg-neutral-800 px-2 py-1 rounded text-xs font-mono border border-neutral-700">
                  {data.topic}
                </code>
                <button
                  onClick={() => handleCopy(data.topic, "topic")}
                  className="p-1.5 hover:bg-neutral-800 rounded transition"
                  title="Copy"
                >
                  {copiedField === "topic" ? (
                    <Check size={16} className="text-emerald-400" />
                  ) : (
                    <Copy size={16} className="text-neutral-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Step 5 */}
            <div className="border-l-2 border-emerald-500/50 pl-4 bg-emerald-500/10 p-3 rounded">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center text-xs font-bold">
                  &#10003;
                </div>
                <h3 className="font-semibold text-white">All Set!</h3>
              </div>
              <p className="text-sm text-neutral-400">
                You&apos;ll now receive notifications before each review
                session.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-500">Error loading setup credentials</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-8 px-4 py-3 border border-neutral-700 text-neutral-400 rounded-lg hover:bg-neutral-800 hover:text-white font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
