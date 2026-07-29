"use client";

/* The "neural core" — a glowing wireframe icosahedron inside two orbital rings,
   particle halo around it. Optional pointerCam: the whole rig parallaxes toward
   the mouse. Colours via props (default = the command-center cyan/violet).
   Default export → lazy ssr:false. (Craft element · r3f-3d-hero) */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "motion/react";
import { type CoreColors, DEFAULT_CORE_COLORS } from "./core-config";

function Particles({ count, color }: { count: number; color: string }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = i * 2.399963; // golden angle (deterministic — SSR-safe, no Math.random)
      const r = 2.6 + (i % 7) * 0.12;
      const y = 1 - (i / count) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      arr[i * 3] = Math.cos(a) * rad * r;
      arr[i * 3 + 1] = y * r;
      arr[i * 3 + 2] = Math.sin(a) * rad * r;
    }
    return arr;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.035} sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

function Core({ pointerCam, colors, particleCount }: { pointerCam: boolean; colors: CoreColors; particleCount: number }) {
  const rig = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const reduce = useReducedMotion();
  const { pointer } = useThree();

  useFrame((_, dt) => {
    if (!reduce) {
      if (core.current) {
        core.current.rotation.y += dt * 0.3;
        core.current.rotation.x += dt * 0.12;
      }
      if (ringA.current) ringA.current.rotation.z += dt * 0.5;
      if (ringB.current) ringB.current.rotation.x += dt * 0.4;
    }
    if (rig.current) {
      const tx = pointerCam ? pointer.x * 0.5 : 0;
      const ty = pointerCam ? pointer.y * 0.4 : 0;
      rig.current.rotation.y += (tx - rig.current.rotation.y) * 0.05;
      rig.current.rotation.x += (-ty - rig.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={rig}>
      <mesh ref={core}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial color={colors.core} emissive={colors.core} emissiveIntensity={0.7} wireframe metalness={0.2} roughness={0.4} />
      </mesh>
      {/* inner translucent glow core */}
      <mesh scale={0.62}>
        <icosahedronGeometry args={[1.4, 0]} />
        <meshBasicMaterial color={colors.glow} transparent opacity={0.28} />
      </mesh>
      <mesh ref={ringA} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.4, 0.012, 16, 140]} />
        <meshBasicMaterial color={colors.ringA} />
      </mesh>
      <mesh ref={ringB} rotation={[0, Math.PI / 3, Math.PI / 2.2]}>
        <torusGeometry args={[2.9, 0.01, 16, 140]} />
        <meshBasicMaterial color={colors.ringB} />
      </mesh>
      <Particles count={particleCount} color={colors.particles} />
    </group>
  );
}

export default function CoreScene({ pointerCam = false, colors = DEFAULT_CORE_COLORS, particleCount = 140 }: { pointerCam?: boolean; colors?: CoreColors; particleCount?: number }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 4, 5]} intensity={1.5} color={colors.lightA} />
      <directionalLight position={[-5, -3, 2]} intensity={1.0} color={colors.lightB} />
      <Core pointerCam={pointerCam} colors={colors} particleCount={particleCount} />
    </Canvas>
  );
}
