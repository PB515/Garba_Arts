'use client';
/**
 * AppHeader — the nav bar, responsive. Desktop keeps the original horizontal
 * layout (brand + inline links + Install/Sign out). Below `md`, the links and
 * Install/Sign out collapse behind a hamburger toggle instead of wrapping
 * onto their own lines — found live on a real phone (the brand name alone
 * was wrapping across 4 lines once 7 nav links had nowhere to go).
 */
import Link from 'next/link';
import { useState } from 'react';
import { InstallButton } from '@/lib/pwa/install-button';

interface NavLinkItem {
  href: string;
  label: string;
  active: boolean;
}

export function AppHeader({
  siteName,
  links,
  userEmail,
  signOutAction,
}: {
  siteName: string;
  links: NavLinkItem[];
  userEmail: string | undefined;
  signOutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-border px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-base font-semibold md:text-lg">{siteName}</span>

        <nav className="hidden items-center gap-4 text-sm md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={l.active ? 'font-semibold' : 'text-muted'}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <InstallButton />
          <form action={signOutAction} className="flex items-center gap-3">
            <span className="text-sm text-muted">{userEmail}</span>
            <button type="submit" className="text-sm underline">
              Sign out
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="rounded-[var(--radius)] border border-border p-2 md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            {open ? (
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            ) : (
              <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 md:hidden">
          <nav className="flex flex-col gap-3 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={l.active ? 'font-semibold' : 'text-muted'}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <InstallButton />
            <span className="text-sm text-muted">{userEmail}</span>
          </div>
          <form action={signOutAction}>
            <button type="submit" className="w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </header>
  );
}
