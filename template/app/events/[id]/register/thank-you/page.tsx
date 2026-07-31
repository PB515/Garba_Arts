import { site } from '@/lib/site';

export default function EventRegisterThankYouPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center text-foreground">
      <div className="max-w-sm space-y-4">
        <h1 className="font-display text-2xl font-semibold">Thank you!</h1>
        <p className="text-sm text-muted">
          Your registration for {site.name}&apos;s event has been recorded. See you there!
        </p>
      </div>
    </div>
  );
}
