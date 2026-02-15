"use server";

import { cookies } from "next/headers";
import webpush from "web-push";

const SUBSCRIPTION_COOKIE = "pwa-subscription";

type ActionResult = { success: true } | { success: false; error: string };

type StoredSubscription = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

type VapidConfig =
  | {
      ok: true;
      publicKey: string;
      privateKey: string;
      subject: string;
    }
  | {
      ok: false;
      error: string;
    };

function getVapidConfig(): VapidConfig {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    return {
      ok: false,
      error:
        "Missing VAPID env vars. Add NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT.",
    };
  }

  return { ok: true, publicKey, privateKey, subject };
}

function normalizeSubscription(
  sub: PushSubscriptionJSON,
): StoredSubscription | null {
  if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys.auth) {
    return null;
  }

  return {
    endpoint: sub.endpoint,
    expirationTime: sub.expirationTime ?? null,
    keys: {
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
  };
}

async function readStoredSubscription(): Promise<StoredSubscription | null> {
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get(SUBSCRIPTION_COOKIE)?.value;

  if (!rawCookie) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(rawCookie)) as StoredSubscription;
    if (!parsed.endpoint || !parsed.keys?.p256dh || !parsed.keys.auth) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function subscribeUser(sub: PushSubscriptionJSON): Promise<ActionResult> {
  const normalized = normalizeSubscription(sub);
  if (!normalized) {
    return { success: false, error: "Invalid push subscription payload." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SUBSCRIPTION_COOKIE, encodeURIComponent(JSON.stringify(normalized)), {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });

  return { success: true };
}

export async function unsubscribeUser(): Promise<ActionResult> {
  const cookieStore = await cookies();
  cookieStore.delete(SUBSCRIPTION_COOKIE);
  return { success: true };
}

export async function sendNotification(message: string): Promise<ActionResult> {
  const subscription = await readStoredSubscription();
  if (!subscription) {
    return {
      success: false,
      error: "No push subscription found. Subscribe first.",
    };
  }

  const vapidConfig = getVapidConfig();
  if (!vapidConfig.ok) {
    return { success: false, error: vapidConfig.error };
  }

  webpush.setVapidDetails(
    vapidConfig.subject,
    vapidConfig.publicKey,
    vapidConfig.privateKey,
  );

  const body = message.trim() || "Push notifications are configured correctly.";

  try {
    await webpush.sendNotification(
      subscription as unknown as webpush.PushSubscription,
      JSON.stringify({
        title: "Next.js PWA Template",
        body,
        icon: "/icon-192x192.png",
        badge: "/badge-72x72.png",
        url: "/",
      }),
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to send push notification", error);
    return {
      success: false,
      error:
        "Failed to send notification. Verify your VAPID keys and browser permissions.",
    };
  }
}
