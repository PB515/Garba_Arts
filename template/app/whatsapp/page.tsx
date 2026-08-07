import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/app/app-shell';
import { EmptyState } from '@/lib/patterns/empty-state';
import { AddTemplateForm } from './add-template-form';
import { TemplateRow } from './template-row';

/**
 * Open to every role (decision, 0027) - view and edit both, for now. Who's
 * allowed to manage these is a deliberately deferred decision, not an
 * oversight; revisit once the owner decides.
 */
export default async function WhatsAppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: templates, error } = await supabase
    .from('message_templates')
    .select('id, label, body')
    .order('created_at', { ascending: true });

  return (
    <AppShell active="whatsapp" userEmail={user?.email}>
      <div className="space-y-8">
        <section className="rounded-[var(--radius)] border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold">Add a template</h2>
          <p className="mb-3 text-sm text-muted">
            Use <code>{'{name}'}</code> anywhere the person's name should go - it gets filled in automatically when
            someone taps WhatsApp on a Lead or Inquiry row.
          </p>
          <AddTemplateForm />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">Templates</h2>
          {error ? (
            <p className="text-sm text-red-600">Could not load: {error.message}</p>
          ) : !templates?.length ? (
            <EmptyState title="No templates yet" message="Add your first message above." />
          ) : (
            <div className="space-y-3">
              {templates.map((t) => (
                <TemplateRow key={t.id} id={t.id} label={t.label} body={t.body} />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
