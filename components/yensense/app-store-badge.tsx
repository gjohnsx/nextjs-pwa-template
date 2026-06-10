"use client";

import { track } from "@vercel/analytics";
import { APP_STORE_URL } from "@/lib/site";

export function AppStoreBadge({
  location,
  className = "",
}: {
  location: string;
  className?: string;
}) {
  return (
    <a
      href={APP_STORE_URL}
      onClick={() => track("app_store_click", { location })}
      aria-label="Download Yen Sense on the App Store"
      className={`inline-flex h-[52px] items-center gap-2.5 rounded-[10px] border border-[#a6a6a6] bg-black px-4 text-white shadow-[0_1px_0_rgba(33,26,22,0.08)] transition-opacity hover:opacity-85 ${className}`}
    >
      <svg
        viewBox="0 0 384 512"
        aria-hidden="true"
        className="h-7 w-auto fill-current"
      >
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.9-61.7-90.5-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
      </svg>
      <span className="flex flex-col items-start leading-none">
        <span className="text-[11px] font-normal tracking-wide">
          Download on the
        </span>
        <span className="mt-0.5 text-xl font-semibold tracking-tight">
          App Store
        </span>
      </span>
    </a>
  );
}
