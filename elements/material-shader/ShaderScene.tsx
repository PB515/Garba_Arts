"use client";

/* ─────────────────────────────────────────────────────────────
   material-shader — an animated "oxidised metal" surface: a fragment shader
   driven by uTime + simplex-noise fbm with domain warp, mixing base → metal
   with a thin accent glint at the band peaks. Colours via props (default =
   oxidised silver). Default export → dynamically imported ssr:false.
   Perf: 3-octave fbm (kept cheap); plane scaled to the viewport.
   (Craft element · material-shader)
   ───────────────────────────────────────────────────────────── */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "motion/react";
import { type ShaderColors, DEFAULT_SHADER_COLORS } from "./material-config";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorA; // base
  uniform vec3 uColorB; // metal
  uniform vec3 uAccent; // glint

  // Ashima/Gustavson simplex noise (2D) — standard, GPU-friendly.
  vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
                              + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                            dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // 3-octave fractal noise — kept cheap on purpose (perf gate).
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++){ v += a * snoise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main(){
    vec2 p = vUv * 2.2;
    float t = uTime * 0.08;

    // domain warp → flowing, organic bands (the "brushed metal" feel)
    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, t)));
    float n = fbm(p + 1.5 * q + vec2(t * 0.5, 0.0));
    n = n * 0.5 + 0.5;

    vec3 col = mix(uColorA, uColorB, smoothstep(0.2, 0.85, n));

    // a thin accent glint where the metal bands peak (used sparingly)
    float glint = smoothstep(0.72, 0.78, n) - smoothstep(0.80, 0.86, n);
    col = mix(col, uAccent, glint * 0.55);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Field({ animate, colors }: { animate: boolean; colors: ShaderColors }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(colors.a) },
      uColorB: { value: new THREE.Color(colors.b) },
      uAccent: { value: new THREE.Color(colors.accent) },
    }),
    [colors.a, colors.b, colors.accent]
  );

  useFrame((state) => {
    if (matRef.current && animate)
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  );
}

export default function ShaderScene({ colors = DEFAULT_SHADER_COLORS }: { colors?: ShaderColors }) {
  const reduce = useReducedMotion();
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 1], fov: 45 }}
      gl={{ antialias: false, alpha: false }}
      // static? render one frame on demand. animated? continuous.
      frameloop={reduce ? "demand" : "always"}
    >
      <Field animate={!reduce} colors={colors} />
    </Canvas>
  );
}
