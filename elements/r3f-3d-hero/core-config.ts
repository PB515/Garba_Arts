/* Colour config for the r3f-3d-hero "neural core". 6-digit hex (used in shaders + alpha-suffixed). */
export type CoreColors = {
  core: string;      // wireframe icosahedron (also emissive)
  glow: string;      // inner translucent core
  ringA: string;     // orbital ring 1
  ringB: string;     // orbital ring 2
  particles: string; // particle halo
  lightA: string;    // key light
  lightB: string;    // fill light
};

export const DEFAULT_CORE_COLORS: CoreColors = {
  core: "#22d3ee",
  glow: "#0891b2",
  ringA: "#38bdf8",
  ringB: "#a78bfa",
  particles: "#38bdf8",
  lightA: "#22d3ee",
  lightB: "#a78bfa",
};
