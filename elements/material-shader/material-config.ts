/* Colour config for the material-shader (animated "oxidised metal" surface). 6-digit hex. */
export type ShaderColors = {
  a: string;      // base / near-black
  b: string;      // highlight / metal
  accent: string; // thin glint at the band peaks
};

export const DEFAULT_SHADER_COLORS: ShaderColors = {
  a: "#0d0e10",
  b: "#c8cbd0",
  accent: "#b23a52",
};
