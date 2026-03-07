import { NextRequest, NextResponse } from "next/server";

// In-memory store for MVP (use a DB in production)
const subscriptions = new Map<string, PushSubscription>();

export async function POST(req: NextRequest) {
  try {
    const { subscription, userId } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Invalid subscription" },
        { status: 400 }
      );
    }

    // Store subscription keyed by a userId (or endpoint)
    const key = userId || subscription.endpoint;
    subscriptions.set(key, subscription);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save subscription" },
      { status: 500 }
    );
  }
}

// Export subscriptions for use by the push route
export { subscriptions };
