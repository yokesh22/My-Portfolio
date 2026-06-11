"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 120;
const BOUNDS = 6; // half-extent of the cube particles live in
const LINK_DISTANCE = 1.5; // proximity threshold for drawing a connection
const MOUSE_RADIUS = 2.2;
const MOUSE_STRENGTH = 0.015;
const FPS_CAP = 30;
const STEP = 1 / FPS_CAP; // min seconds between simulation updates

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

interface Sim {
  particles: Particle[];
  linePositions: Float32Array;
  dummy: THREE.Object3D;
  mouseWorld: THREE.Vector3;
}

function ParticleField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lineGeoRef = useRef<THREE.BufferGeometry>(null);
  const { viewport, pointer } = useThree();

  // All mutable simulation state lives in refs. useFrame mutates it every
  // frame — expected for R3F, but the React Compiler treats useMemo results
  // as frozen render values, so they can't be mutated. Refs are the
  // sanctioned mutable escape hatch.
  const simRef = useRef<Sim | null>(null);
  const accRef = useRef(0); // delta accumulator for the fps cap

  // Build particle data once, after mount. Keeps Math.random off the render
  // path (react-hooks/purity) and binds the line buffer to the geometry.
  useEffect(() => {
    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * BOUNDS * 2,
        (Math.random() - 0.5) * BOUNDS * 2,
        (Math.random() - 0.5) * BOUNDS,
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
      ),
    }));

    // Preallocate a line buffer sized for the worst case we'll actually draw.
    const linePositions = new Float32Array(COUNT * 6 * 2 * 3);
    const geo = lineGeoRef.current;
    if (geo) {
      geo.setAttribute(
        "position",
        new THREE.BufferAttribute(linePositions, 3),
      );
    }

    simRef.current = {
      particles,
      linePositions,
      dummy: new THREE.Object3D(),
      mouseWorld: new THREE.Vector3(),
    };
  }, []);

  useFrame((_, delta) => {
    const sim = simRef.current;
    const mesh = meshRef.current;
    const geo = lineGeoRef.current;
    if (!sim || !mesh || !geo) return;

    // Cap the simulation at 30fps regardless of display refresh rate.
    accRef.current += delta;
    if (accRef.current < STEP) return;
    accRef.current = 0;

    const { particles, linePositions, dummy, mouseWorld } = sim;

    // Map the pointer (NDC) onto the particle plane in world units.
    mouseWorld.set(
      (pointer.x * viewport.width) / 2,
      (pointer.y * viewport.height) / 2,
      0,
    );

    // Integrate positions: drift + bounds wrap + gentle mouse repulsion.
    for (let i = 0; i < COUNT; i++) {
      const p = particles[i];
      p.position.add(p.velocity);

      if (p.position.x > BOUNDS || p.position.x < -BOUNDS) p.velocity.x *= -1;
      if (p.position.y > BOUNDS || p.position.y < -BOUNDS) p.velocity.y *= -1;
      if (p.position.z > BOUNDS / 2 || p.position.z < -BOUNDS / 2) {
        p.velocity.z *= -1;
      }

      const dx = p.position.x - mouseWorld.x;
      const dy = p.position.y - mouseWorld.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < MOUSE_RADIUS * MOUSE_RADIUS && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const force = (MOUSE_RADIUS - dist) * MOUSE_STRENGTH;
        p.position.x += (dx / dist) * force;
        p.position.y += (dy / dist) * force;
      }

      dummy.position.copy(p.position);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // Rebuild proximity links.
    let ptr = 0;
    const limit = linePositions.length - 6;
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        if (ptr > limit) break;
        const a = particles[i].position;
        const b = particles[j].position;
        if (a.distanceTo(b) < LINK_DISTANCE) {
          linePositions[ptr++] = a.x;
          linePositions[ptr++] = a.y;
          linePositions[ptr++] = a.z;
          linePositions[ptr++] = b.x;
          linePositions[ptr++] = b.y;
          linePositions[ptr++] = b.z;
        }
      }
    }
    geo.setDrawRange(0, ptr / 3);
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.85} />
      </instancedMesh>
      <lineSegments>
        <bufferGeometry ref={lineGeoRef} />
        <lineBasicMaterial color="#22d3ee" transparent opacity={0.28} />
      </lineSegments>
    </group>
  );
}

export default function ParticleBg() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ParticleField />
        </Suspense>
      </Canvas>
    </div>
  );
}
