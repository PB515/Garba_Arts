'use client';
/**
 * InstallButton — the one place someone finds "how do I install this."
 *
 * Three real states, not one:
 * - Android/Chrome/Edge: a genuine install button, wired to the browser's
 *   `beforeinstallprompt` event. Hidden until that event actually fires (it
 *   never fires if already installed, or on a browser that doesn't support
 *   it at all - e.g. desktop Safari/Firefox), so this never shows a button
 *   that would do nothing.
 * - iOS Safari: there is no programmatic install API - Apple doesn't allow
 *   one. Same button position, but it opens instructions (Share -> Add to
 *   Home Screen) instead of a native prompt. Detected by user agent, shown
 *   unless already running installed (`navigator.standalone`).
 * - Anyone else (already installed, or a browser with neither path): no
 *   button at all.
 */
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      setIsIos(true);
      return;
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  async function handleClick() {
    if (isIos) {
      setShowIosSteps(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  }

  if (!isIos && !deferredPrompt) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
      >
        Install app
      </button>

      {showIosSteps ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowIosSteps(false)}
        >
          <div
            className="w-full max-w-sm rounded-[var(--radius)] border border-border bg-background p-5 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 font-semibold">Install on iPhone</h2>
            <ol className="mb-4 list-decimal space-y-2 pl-5">
              <li>
                Tap the <strong>Share</strong> icon (square with an arrow pointing up) in Safari's toolbar.
              </li>
              <li>
                Scroll down and tap <strong>Add to Home Screen</strong>.
              </li>
              <li>
                Tap <strong>Add</strong> in the top-right corner.
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIosSteps(false)}
              className="w-full rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
