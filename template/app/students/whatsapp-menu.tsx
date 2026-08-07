'use client';
/**
 * The WhatsApp quick-message button, now a small menu of pre-built links
 * instead of one fixed message (decision: several reusable templates,
 * 0027). Links are computed server-side (per row, per template) and passed
 * in ready-made - this component only handles showing/hiding the menu, so
 * it never needs to import the server-oriented helpers in lib/form.ts.
 */
import { useEffect, useRef, useState } from 'react';

interface WaOption {
  label: string;
  href: string;
}

export function WhatsAppMenu({ options }: { options: WaOption[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!options.length) return <>-</>;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-[var(--radius)] border border-border px-2 py-1 text-xs font-medium"
      >
        WhatsApp
      </button>
      {open ? (
        <div className="absolute z-10 mt-1 w-52 rounded-[var(--radius)] border border-border bg-background p-1 shadow-md">
          {options.map((o) => (
            <a
              key={o.label}
              href={o.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="block rounded-[var(--radius)] px-2 py-1 text-xs hover:bg-muted/20"
            >
              {o.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
