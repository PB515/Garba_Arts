import Link from 'next/link';
import { site } from '@/lib/site';

export default function NavratriThankYouPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center text-foreground">
      <div className="max-w-sm space-y-4">
        <h1 className="font-display text-2xl font-semibold">Thank you!</h1>
        <p className="text-sm text-muted">
          Your registration for {site.name}&apos;s Navratri pass has been recorded. Our team will follow up
          with payment details.
        </p>
        <Link href="/navratri" className="text-sm underline">
          Register another group
        </Link>
      </div>
    </div>
  );
}
