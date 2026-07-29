import { shaktipeethReel } from "<your-scenes-source>";
import type { CinematicSagaConfig } from "./CinematicScrollSaga";

/* The Hinglaj "Fall of Sati" chapter as data for the CinematicScrollSaga element.
   All Hinglaj-specific content lives here; the component is generic. */
export const shaktipeethSaga: CinematicSagaConfig = {
  scenes: shaktipeethReel,
  mapImage: "/art/stories/shaktipeeth/desktop/s5-far.webp",
  beats: [
    { x: 50, y: 42, deva: "देह का विभाजन", en: "The body is parted", body: "Borne by grieving Shiva, Devi Sati's body was parted by Vishnu's Sudarshan — and across all of Jambudvip the parts came down to the earth." },
    { all: true, deva: "इकयावन शक्तिपीठ", en: "The fifty-one Shakti Peethas", body: "Where each part fell, a seat of power arose — fifty-one Shakti Peethas, binding the whole of the land together like beads upon one thread." },
    { x: 17, y: 27, hinglaj: true, deva: "हिंगलाज", en: "Hinglaj — where the crown fell", body: "On the Hingol, in the Makran hills, fell her brahmarandhra — the tenth gate. Of all the fifty-one, the westernmost seat, and the very door of liberation, came to rest here." },
  ],
  peethas: [
    { x: 34, y: 26 }, { x: 44, y: 23 }, { x: 54, y: 24 }, { x: 62, y: 29 },
    { x: 30, y: 33 }, { x: 41, y: 36 }, { x: 50, y: 34 }, { x: 57, y: 39 },
    { x: 46, y: 45 }, { x: 52, y: 51 }, { x: 48, y: 60 }, { x: 36, y: 42 },
  ],
  finalePhoto: "/art/temple/hinglaj.jpg",
  finaleText: {
    deva: "हिंगलाज माता",
    en: "The living shrine · Hingol, Balochistan",
    body: "Today pilgrims still climb to the cave-shrine on the Hingol — the seat of the fallen crown, alive across the ages.",
  },
  sceneWeights: [2.6, 2.6, 2.6, 1.4],
  beatWeight: 1.8,
  finaleWeight: 1.4,
  vhPerUnit: 150,
};
