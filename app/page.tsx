"use client";

import { useEffect, useState } from "react";
import { sendNotification, subscribeUser, unsubscribeUser } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

function PushNotificationManager() {
  const [isSupported] = useState(
    () =>
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window,
  );
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState("Hello from your Next.js PWA!");

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    let active = true;

    navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })
      .then((registration) => registration.pushManager.getSubscription())
      .then((existingSubscription) => {
        if (active) {
          setSubscription(existingSubscription);
        }
      })
      .catch(() => {
        if (active) {
          toast.error("Could not register the service worker.");
        }
      });

    return () => {
      active = false;
    };
  }, [isSupported]);

  async function handleSubscribe() {
    if (!vapidPublicKey) {
      toast.warning(
        "Add NEXT_PUBLIC_VAPID_PUBLIC_KEY in .env.local (and Vercel) before subscribing.",
      );
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const response = await subscribeUser(
        JSON.parse(JSON.stringify(pushSubscription)) as PushSubscriptionJSON,
      );

      if (!response.success) {
        toast.error(response.error);
        return;
      }

      setSubscription(pushSubscription);
      toast.success("Push subscription created.");
    } catch {
      toast.error("Subscription failed. Verify permissions and your VAPID key.");
    }
  }

  async function handleUnsubscribe() {
    try {
      await subscription?.unsubscribe();
      const response = await unsubscribeUser();
      if (!response.success) {
        toast.error(response.error);
        return;
      }
      setSubscription(null);
      toast.success("Push subscription removed.");
    } catch {
      toast.error("Could not unsubscribe from push notifications.");
    }
  }

  async function handleSendNotification() {
    const response = await sendNotification(message);
    if (!response.success) {
      toast.error(response.error);
      return;
    }

    toast.success("Notification sent.");
  }

  if (!isSupported) {
    return (
      <Card className="border-black/10 bg-[var(--surface-muted)] shadow-sm">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl">Push Notifications</CardTitle>
          <CardDescription className="text-sm text-slate-700">
            This browser does not support Service Workers + Push APIs.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-black/10 bg-[var(--surface-muted)] shadow-sm">
      <CardHeader className="gap-2">
        <CardTitle className="text-xl">Push Notifications</CardTitle>
        <CardDescription className="text-sm text-slate-700">
          Keep this optional for your template users. If VAPID keys are missing, install still works, but push features stay disabled.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subscription ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-emerald-700">
              Subscribed and ready.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Notification message"
                className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              />
              <Button type="button" onClick={handleSendNotification}>
                Send Test
              </Button>
            </div>
            <Button
              type="button"
              onClick={handleUnsubscribe}
              variant="outline"
            >
              Unsubscribe
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Not subscribed yet.
            </p>
            <Button type="button" onClick={handleSubscribe}>
              Subscribe
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
}

function InstallPrompt() {
  const [isIOS] = useState(
    () =>
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent),
  );
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
    );
  });
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const displayModeQuery = window.matchMedia("(display-mode: standalone)");

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleDisplayModeChange = () => {
      setIsStandalone(
        displayModeQuery.matches ||
          Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
      );
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      toast.success("App installed.");
    };

    displayModeQuery.addEventListener("change", handleDisplayModeChange);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      displayModeQuery.removeEventListener("change", handleDisplayModeChange);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) {
      toast.info("Use your browser install option.");
      return;
    }

    await deferredPrompt.prompt();
    const userChoice = await deferredPrompt.userChoice;

    if (userChoice.outcome === "accepted") {
      toast.success("Install prompt accepted.");
    } else {
      toast.warning("Install prompt dismissed.");
    }

    setDeferredPrompt(null);
  }

  return (
    <Card className="border-black/10 bg-[var(--surface-muted)] shadow-sm">
      <CardHeader className="gap-2">
        <CardTitle className="text-xl">Install App</CardTitle>
        <CardDescription className="text-sm text-slate-700">
          Deployed over HTTPS on Vercel, this app is installable on Android and iOS.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isStandalone ? (
          <p className="rounded-none bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-800">
            Already running as an installed app.
          </p>
        ) : (
          <>
            <Button type="button" onClick={handleInstallClick}>
              Add to Home Screen
            </Button>

            {isIOS ? (
              <p className="mt-3 text-sm text-slate-700">
                iOS: tap Share, then <strong>Add to Home Screen</strong>.
              </p>
            ) : null}
          </>
        )}

      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-5 py-10 sm:px-10">
      <Card className="border-black/10 bg-[var(--surface)] p-8 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.5)]">
        <CardHeader className="gap-3 px-0">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
            Next.js 16.1.6 + Bun + Vercel
          </p>
          <CardTitle className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Clone. Deploy. Install on Phone.
          </CardTitle>
          <CardDescription className="max-w-2xl text-base text-slate-700">
            This repo is pre-wired as a template starter. Push support is optional, installability is built in, and deployment to Vercel is straightforward.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-3 px-0">
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noreferrer"
              >
                Open Vercel Import
              </a>
            </Button>
            <Button asChild variant="outline">
              <a
                href="https://nextjs.org/docs"
                target="_blank"
                rel="noreferrer"
              >
                Next.js Docs
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-black/10 bg-[var(--surface-muted)] shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Quick Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-slate-700">
              <li>1. Copy `.env.example` to `.env.local`.</li>
              <li>2. Run `bun run vapid:generate` and fill keys.</li>
              <li>3. Run `bun run dev:https` for local HTTPS testing.</li>
              <li>4. Import the repo in Vercel and set the same env vars.</li>
              <li>5. Deploy and install from your phone browser.</li>
            </ol>
          </CardContent>
        </Card>
        <InstallPrompt />
      </section>

      <PushNotificationManager />
    </main>
  );
}
