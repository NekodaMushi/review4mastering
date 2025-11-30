"use client";

import { useEffect, useState } from "react";
import { X, Copy, Check, AlertCircle } from "lucide-react";

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
      try {
        const response = await fetch("/api/notifications/subscribe-link");
        if (!response.ok) throw new Error("Failed to fetch subscribe link");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching notification data:", error);
      } finally {
        setLoading(false);
      }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            📱 Setup Notifications
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close panel"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading setup credentials...</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Warning Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle
                size={20}
                className="text-blue-600 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-blue-900">
                Follow these steps to set up push notifications in the ntfy
                Android app.
              </p>
            </div>

            {/* Step 1 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900">Open ntfy App</h3>
              </div>
              <p className="text-sm text-gray-700">
                Launch the ntfy Android app on your device.
              </p>
            </div>

            {/* Step 2 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900">Go to Settings</h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                Tap the menu button (⋮) → <strong>Settings</strong> →{" "}
                <strong>Manage Users</strong>
              </p>
            </div>

            {/* Step 3 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900">Add Credentials</h3>
              </div>

              <p className="text-xs text-gray-700 font-medium mb-3">
                Copy &amp; paste these credentials:
              </p>

              {/* Credentials Box */}
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {/* Server */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Server
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="text-gray-900 flex-1 bg-white px-2 py-1 rounded text-xs font-mono border border-gray-300">
                      {data.server}
                    </code>
                    <button
                      onClick={() => handleCopy(data.server, "server")}
                      className="p-1.5 hover:bg-gray-200 rounded transition"
                      title="Copy"
                    >
                      {copiedField === "server" ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} className="text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Username
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="text-gray-900 flex-1 bg-white px-2 py-1 rounded text-xs font-mono border border-gray-300">
                      {data.username}
                    </code>
                    <button
                      onClick={() => handleCopy(data.username, "username")}
                      className="p-1.5 hover:bg-gray-200 rounded transition"
                      title="Copy"
                    >
                      {copiedField === "username" ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} className="text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Password
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="text-gray-900 flex-1 bg-white px-2 py-1 rounded text-xs font-mono border border-gray-300 break-all">
                      {data.password}
                    </code>
                    <button
                      onClick={() => handleCopy(data.password, "password")}
                      className="p-1.5 hover:bg-gray-200 rounded transition flex-shrink-0"
                      title="Copy"
                    >
                      {copiedField === "password" ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} className="text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <h3 className="font-semibold text-gray-900">
                  Subscribe to Topic
                </h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                After adding the user, tap &quot;+&quot; &rarr; paste this topic
                name:
              </p>
              <div className="flex items-center gap-2">
                <code className="text-gray-900 flex-1 bg-gray-100 px-2 py-1 rounded text-xs font-mono border border-gray-300">
                  {data.topic}
                </code>
                <button
                  onClick={() => handleCopy(data.topic, "topic")}
                  className="p-1.5 hover:bg-gray-100 rounded transition"
                  title="Copy"
                >
                  {copiedField === "topic" ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Step 5 */}
            <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-3 rounded">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                  &#10003;
                </div>
                <h3 className="font-semibold text-gray-900">All Set!</h3>
              </div>
              <p className="text-sm text-gray-700">
                You&apos;ll now receive notifications before each review
                session.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Error loading setup credentials</p>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-8 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
