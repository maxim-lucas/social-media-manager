"use client";

import { useCallback, useId, useState } from "react";
import { ToastViewport, type ToastData, type ToastVariant } from "./Toast";

type Platform = "facebook" | "instagram";

type PublishResponse =
  | { ok: true; platform: Platform; postId: string }
  | { ok: false; error: string; message: string; tokenExpired?: boolean };

let toastCounter = 0;

export default function PublishDashboard() {
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [platform, setPlatform] = useState<Platform>("facebook");
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const captionId = useId();
  const imageUrlId = useId();

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((variant: ToastVariant, title: string, description?: string) => {
    toastCounter += 1;
    setToasts((current) => [...current, { id: toastCounter, variant, title, description }]);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, imageUrl, platform }),
      });
      const data = (await res.json()) as PublishResponse;

      if (data.ok) {
        pushToast("success", "Post published", `Meta post ID: ${data.postId}`);
      } else if (data.tokenExpired) {
        pushToast(
          "warning",
          "Access token expired",
          "The Meta access token for this account has expired. Reconnect the page/Instagram account and try again.",
        );
      } else {
        pushToast("error", "Publish failed", data.message);
      }
    } catch {
      pushToast("error", "Publish failed", "Could not reach the publish endpoint. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex w-full flex-1 justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">Publish a post</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Compose a caption and image, then publish to Facebook or Instagram via the Meta Graph API.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor={captionId} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Caption
            </label>
            <textarea
              id={captionId}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder="Write your caption..."
              className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={imageUrlId} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Image URL
            </label>
            <input
              id={imageUrlId}
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Platform</legend>
            <div className="flex gap-4">
              {(["facebook", "instagram"] as const).map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm capitalize text-zinc-800 has-checked:border-zinc-500 has-checked:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:has-checked:border-zinc-400 dark:has-checked:bg-zinc-900"
                >
                  <input
                    type="radio"
                    name="platform"
                    value={option}
                    checked={platform === option}
                    onChange={() => setPlatform(option)}
                    className="h-4 w-4 accent-zinc-800 dark:accent-zinc-200"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {submitting ? "Publishing..." : "Publish"}
          </button>
        </form>
      </div>

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
