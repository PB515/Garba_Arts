// supply your own subtitle (e.g. a mantra/tagline) below
import type { GatewayConfig } from "./PreloaderGateway";

/* The Hinglaj temple-door gateway as data for the PreloaderGateway element.
   All Hinglaj-specific art + copy lives here; the component is generic. */
export const doorGateway: GatewayConfig = {
  backdrop: { d: "/art/door/desktop-backdrop.webp", m: "/art/door/01-backdrop.webp" },
  leaf: { d: "/art/door/desktop-leaf.webp", m: "/art/door/02-leaf.webp" },
  toran: "/art/door/04-foreground-toran.webp",
  title: "हिंगलाज माता",
  subtitle: "<your subtitle>",
  backdropAlt: "The sanctum of Hinglaj Mata",
  scrollCue: "scroll to enter",
  heightVh: 450,
  openAt: 0.4,
};
