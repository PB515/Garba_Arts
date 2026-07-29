'use client';
/**
 * chip-list-editor — use when editing a list of short string values (tags,
 * categories, keywords, sizes) as removable chips with an add field.
 *
 * Controlled: pass `value` + `onChange`. Dedupes, trims, and enforces an
 * optional max. Recurred across builds wherever an admin edits a string array.
 */
import { useState, type KeyboardEvent } from 'react';
import { X, Plus } from '../icons';

export interface ChipListEditorProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  max?: number;
}

export function ChipListEditor({
  value,
  onChange,
  placeholder = 'Add and press Enter',
  max,
}: ChipListEditorProps) {
  const [draft, setDraft] = useState('');

  function add() {
    const v = draft.trim();
    if (!v) return;
    if (value.includes(v)) {
      setDraft('');
      return;
    }
    if (max != null && value.length >= max) return;
    onChange([...value, v]);
    setDraft('');
  }

  function remove(chip: string) {
    onChange(value.filter((c) => c !== chip));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !draft && value.length) {
      remove(value[value.length - 1]);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border p-2">
      {value.map((chip) => (
        <span
          key={chip}
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm"
        >
          {chip}
          <button
            type="button"
            onClick={() => remove(chip)}
            aria-label={`Remove ${chip}`}
            className="opacity-60 hover:opacity-100"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <span className="inline-flex items-center gap-1">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="min-w-32 flex-1 bg-transparent text-sm outline-none"
        />
        <button type="button" onClick={add} aria-label="Add" className="opacity-60 hover:opacity-100">
          <Plus className="size-4" />
        </button>
      </span>
    </div>
  );
}
