import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

let vapidConfigured = false;

function ensureVapid() {
  if (!vapidConfigured) {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (!publicKey || !privateKey) {
      throw new Error("VAPID keys are not set in environment variables");
    }
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:habiat@example.com",
      publicKey,
      privateKey
    );
    vapidConfigured = true;
  }
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    ensureVapid();

    const { subscription, title, body, habitId, snoozeDuration, tag, image } =
      await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "No subscription provided" },
        { status: 400 }
      );
    }

    const payload = JSON.stringify({
      title: title || "habi.at",
      body: body || "Time for your habit! 🔥",
      habitId,
      snoozeDuration: snoozeDuration || 10,
      tag: tag || `habit-${habitId || Date.now()}`,
      image,
      url: "/",
    });

    await webpush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const statusCode =
      error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500;
    const message = error instanceof Error ? error.message : "Push failed";

    return NextResponse.json(
      { error: message, statusCode },
      { status: statusCode === 410 ? 410 : 500 }
    );
  }
}
