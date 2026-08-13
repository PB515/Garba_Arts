import { Fraunces, Karla } from 'next/font/google';
import '../poster.css';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-poster-display' });
const karla = Karla({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-poster-body' });

export default function EventRegisterThankYouPage() {
  return (
    <div
      className={`poster ${fraunces.variable} ${karla.variable}`}
      style={{ justifyContent: 'center', minHeight: '100vh' }}
    >
      <p className="poster-eyebrow">The Garba Arts</p>
      <h1 className="poster-thankyou-title">Thank you!</h1>
      <p className="poster-thankyou-body">Your registration has been recorded. See you there!</p>
    </div>
  );
}
