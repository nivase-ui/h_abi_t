"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing, Settings, X } from "lucide-react";
import {
  useNotificationPermission,
  useNotificationScheduler,
} from "../lib/notifications";

const DISMISSED_KEY = "habiat-notif-dismissed";

export default function NotificationBanner() {
  const [mounted, setMounted] = useState(false);
  const [permState, setPermState] = useState<string>("default");
  const [loading, setLoading] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const { requestPermission, getPermissionState } =
    useNotificationPermission();

  // Activate the scheduler
  useNotificationScheduler();

  useEffect(() => {
    const state = getPermissionState();
    const wasDismissed = sessionStorage.getItem(DISMISSED_KEY);

    queueMicrotask(() => {
      setMounted(true);
      setPermState(state);

      // Auto-show interstitial if permission hasn't been decided and not dismissed this session
      if (state === "default" && !wasDismissed) {
        setShowInterstitial(true);
      }
    });
  }, [getPermissionState]);

  const handleEnable = async () => {
    setLoading(true);
    // This runs inside a click handler = user gesture = browser allows it
    const granted = await requestPermission();
    setPermState(granted ? "granted" : "denied");
    setLoading(false);
    setShowInterstitial(false);
    if (!granted) {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    }
  };

  const handleDismiss = () => {
    setShowInterstitial(false);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  };

  if (!mounted) return null;

  // ─── Full-screen interstitial (first visit) ────────────────
  if (showInterstitial && permState === "default") {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center px-8 text-center">
        {/* Skip button */}
        <button
          onClick={handleDismiss}
          className="absolute top-14 right-5 w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated bell */}
        <div className="w-24 h-24 rounded-3xl bg-lava/15 flex items-center justify-center mb-8 animate-bounce">
          <BellRing className="w-12 h-12 text-lava" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          Never miss a habit
        </h2>
        <p className="text-gray-400 text-[15px] leading-relaxed max-w-[300px] mb-10">
          Get timely reminders for your habits — just like your favourite apps. 
          We&apos;ll nudge you at the right moment.
        </p>

        {/* CTA — This is a user gesture, so browser WILL show the prompt */}
        <button
          onClick={handleEnable}
          disabled={loading}
          className="w-full max-w-[300px] bg-lava hover:bg-lava-dark text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-xl shadow-lava/30 active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-2.5"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Bell className="w-5 h-5" />
              Allow Notifications
            </>
          )}
        </button>

        <button
          onClick={handleDismiss}
          className="mt-4 text-sm text-gray-600 hover:text-gray-400 transition-colors py-2"
        >
          Maybe later
        </button>
      </div>
    );
  }

  // ─── Already granted — silent ───────────────────────────────
  if (permState === "granted" || permState === "unsupported") return null;

  // ─── Denied — instructions banner ──────────────────────────
  if (permState === "denied") {
    return (
      <div className="mx-5 mb-4 p-4 rounded-2xl bg-surface border border-white/[0.04] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
          <BellOff className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium">
            Notifications blocked
          </p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Open your browser settings → Site settings → Notifications → Allow for this site.
          </p>
        </div>
        <a
          href="https://support.google.com/chrome/answer/3220216"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center text-gray-500 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
        </a>
      </div>
    );
  }

  // ─── Default (not yet asked) — inline banner fallback ──────
  return (
    <div className="mx-5 mb-4 p-4 rounded-2xl bg-lava/[0.06] border border-lava/15 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-lava/15 flex items-center justify-center shrink-0">
        <BellRing className="w-5 h-5 text-lava" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">
          Enable notifications
        </p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
          Get reminders at your habit times.
        </p>
      </div>
      <button
        onClick={handleEnable}
        disabled={loading}
        className="shrink-0 px-4 py-2.5 bg-lava text-white text-sm font-semibold rounded-xl shadow-lg shadow-lava/25 hover:bg-lava-dark transition-all active:scale-95 disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5" />
            Enable
          </span>
        )}
      </button>
    </div>
  );
}
