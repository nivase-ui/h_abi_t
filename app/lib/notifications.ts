"use client";

import { useEffect, useRef, useCallback } from "react";
import { useHabitStore } from "../store/habitStore";
import type { Habit, FrequencyType } from "../types/habit";

// ─── Utility: convert VAPID base64 to Uint8Array ─────────────
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}

// ─── Check if habit is due today ──────────────────────────────
function isHabitDueToday(habit: Habit): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0-6
  const dayOfMonth = now.getDate(); // 1-31
  const todayStr = now.toISOString().split("T")[0]; // yyyy-MM-dd

  switch (habit.frequency as FrequencyType) {
    case "daily":
      return true;
    case "weekly":
      return (habit.weekDays || []).includes(dayOfWeek);
    case "monthly":
      return (habit.monthDays || []).includes(dayOfMonth);
    case "dates":
      return (habit.selectedDates || []).includes(todayStr);
    default:
      return true;
  }
}

// ─── Get push subscription ────────────────────────────────────
async function getSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator)) return null;
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();

  if (!sub) {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return null;

    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    // Save to server
    await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub }),
    });
  }

  return sub;
}

// ─── Send push via server ─────────────────────────────────────
async function sendPushNotification(
  subscription: PushSubscription,
  habit: Habit
) {
  await fetch("/api/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscription,
      title: `🔥 ${habit.name}`,
      body: `Hey! It's time for "${habit.name}". Let's go! 💪`,
      habitId: habit.id,
      snoozeDuration: habit.snoozeDuration,
      tag: `habit-${habit.id}`,
    }),
  });
}

// ─── Schedule via Service Worker (fallback for local) ─────────
function scheduleViaServiceWorker(
  registration: ServiceWorkerRegistration,
  habit: Habit,
  delayMs: number
) {
  registration.active?.postMessage({
    type: "SCHEDULE_NOTIFICATION",
    delay: delayMs,
    title: `🔥 ${habit.name}`,
    body: `Hey! It's time for "${habit.name}". Let's go! 💪`,
    tag: `habit-${habit.id}`,
    habitId: habit.id,
    snoozeDuration: habit.snoozeDuration,
  });
}

// ─── Hook: useNotificationScheduler ──────────────────────────
export function useNotificationScheduler() {
  const habits = useHabitStore((s) => s.habits);
  const toggleComplete = useHabitStore((s) => s.toggleComplete);
  const scheduledRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Listen for HABIT_DONE messages from service worker
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type === "HABIT_DONE" && event.data.habitId) {
        const today = new Date().toISOString().split("T")[0];
        toggleComplete(event.data.habitId, today);
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);
    return () =>
      navigator.serviceWorker.removeEventListener("message", handler);
  }, [toggleComplete]);

  // Schedule notifications
  const scheduleAll = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const reg = await navigator.serviceWorker.ready;
    const sub = await getSubscription();
    const now = new Date();
    const todayKey = now.toISOString().split("T")[0];

    for (const habit of habits) {
      if (!isHabitDueToday(habit)) continue;
      if (habit.completedDates.includes(todayKey)) continue;

      const scheduleKey = `${habit.id}-${todayKey}-${habit.time}`;
      if (scheduledRef.current.has(scheduleKey)) continue;

      const [h, m] = habit.time.split(":").map(Number);
      const target = new Date();
      target.setHours(h, m, 0, 0);

      const delayMs = target.getTime() - now.getTime();

      if (delayMs < -60000) {
        // More than 1 minute past → skip
        continue;
      }

      if (delayMs <= 0) {
        // Due now or within last minute → send immediately
        if (sub) {
          await sendPushNotification(sub, habit);
        } else {
          scheduleViaServiceWorker(reg, habit, 0);
        }
      } else {
        // Future → schedule via SW message
        if (sub) {
          // Schedule a delayed push via service worker for reliability
          scheduleViaServiceWorker(reg, habit, delayMs);
        } else {
          scheduleViaServiceWorker(reg, habit, delayMs);
        }
      }

      scheduledRef.current.add(scheduleKey);
    }
  }, [habits]);

  // Run scheduler every minute and on habit changes
  useEffect(() => {
    scheduleAll();

    intervalRef.current = setInterval(scheduleAll, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [scheduleAll]);
}

// ─── Hook: useNotificationPermission ─────────────────────────
export function useNotificationPermission() {
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;
    if (!("serviceWorker" in navigator)) return false;

    // Register SW first
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      // Subscribe to push
      await getSubscription();

      // Send a welcome notification
      reg.active?.postMessage({
        type: "SCHEDULE_NOTIFICATION",
        delay: 500,
        title: "🔥 habi.at",
        body: "Notifications enabled! We'll remind you of your habits.",
        tag: "welcome",
        habitId: null,
        snoozeDuration: 10,
      });

      return true;
    }

    return false;
  }, []);

  const getPermissionState = useCallback((): NotificationPermission | "unsupported" => {
    if (!("Notification" in window)) return "unsupported";
    return Notification.permission;
  }, []);

  return { requestPermission, getPermissionState };
}
