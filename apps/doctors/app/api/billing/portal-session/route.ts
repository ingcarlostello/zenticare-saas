import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PADDLE_ROUTES } from "@repo/database/convex/paddle-routes";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!convexUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_CONVEX_SITE_URL is not defined" }, { status: 500 });
  }

  const response = await fetch(`${convexUrl}${PADDLE_ROUTES.PORTAL_SESSION}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clerkId: userId }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      return NextResponse.json({ error: "no_subscription" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to create portal session" }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
