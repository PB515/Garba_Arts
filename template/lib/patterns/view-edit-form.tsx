'use client';
/**
 * view-edit-form — use when a record toggles between a read-only "view" and an
 * inline "edit" form (profile fields, settings rows, admin detail panels).
 *
 * Handles the view/edit/saving state machine + cancel-restores-original so each
 * editable field doesn't reinvent it. Pass a `save` that persists and resolves;
 * render props supply the current draft + helpers for each mode.
 */
import { useState, type ReactNode } from 'react';

export interface ViewEditFormProps<T> {
  initial: T;
  save: (value: T) => Promise<void>;
  view: (value: T, edit: () => void) => ReactNode;
  edit: (args: {
    draft: T;
    set: (patch: Partial<T>) => void;
    save: () => void;
    cancel: () => void;
    saving: boolean;
    error: string | null;
  }) => ReactNode;
}

export function ViewEditForm<T extends object>({
  initial,
  save,
  view,
  edit,
}: ViewEditFormProps<T>) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<T>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(patch: Partial<T>) {
    setDraft((d) => ({ ...d, ...patch }));
  }
  function cancel() {
    setDraft(initial);
    setError(null);
    setEditing(false);
  }
  async function commit() {
    setSaving(true);
    setError(null);
    try {
      await save(draft);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  return editing
    ? edit({ draft, set, save: commit, cancel, saving, error })
    : view(initial, () => {
        setDraft(initial);
        setEditing(true);
      });
}
