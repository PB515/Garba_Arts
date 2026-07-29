# material-shader · v1 (oxidised-metal band)

An animated "oxidised metal" surface — a fragment shader driven by `uTime` + simplex-noise **fbm
with domain warp**, mixing a base → metal colour with a thin accent glint at the band peaks.
Used as a **background band** behind content. Ships the perf-safe wrapper (lazy `ssr:false` +
`IntersectionObserver` mount + static-gradient fallback on weak devices; reduced-motion → frozen
frame). Colours via props.

> Harvested & proven on **bugadi-showpage** (the flagship oxidised-silver band; build-verified). `status: proven`.

## Files
- `ShaderBand.tsx` — the wrapper (mount this; wraps your content as `children`).
- `ShaderScene.tsx` — the R3F + GLSL scene (default export, dynamically imported).
- `material-config.ts` — `ShaderColors` type + `DEFAULT_SHADER_COLORS` (oxidised silver).

## Install
1. Copy all three files into `components/`.
2. Deps: **`three`**, **`@react-three/fiber`**, **`motion`**.

## Use
```tsx
import { ShaderBand } from "@/components/ShaderBand";

<ShaderBand>            {/* default oxidised silver */}
  <div className="py-40 text-center">…content over the moving surface…</div>
</ShaderBand>

// re-toned to a brand (any subset; rest fall back):
<ShaderBand colors={{ a: "#1a0e10", b: "#c9a227", accent: "#b5302a" }} veil={0.35}>
  …
</ShaderBand>
```

## Props
| prop | default | notes |
|---|---|---|
| `children` | — | content rendered over the band |
| `colors` | `DEFAULT_SHADER_COLORS` | `Partial<{ a, b, accent }>` — base / metal / glint (6-digit hex) |
| `veil` | `0.4` | 0–1 legibility scrim opacity over the surface (uses `colors.a`) |

## Notes
- The static fallback gradient **and** veil are derived from `colors` (inline-styled) — the element
  is self-contained, no site-token dependency.
- The fbm is **3 octaves on purpose** (perf gate); don't bump it casually. Fork a `v2` for a
  different shader rather than editing the GLSL in v1.
