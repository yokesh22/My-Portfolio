"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 120;
const BOUNDS = 6; // half-extent of the cube particles live in
const LINK_DISTANCE = 1.5; // proximity threshold for drawing a connection
const MOUSE_RADIUS = 2.2;
const MOUSE_STRENGTH = 0.015;

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

function ParticleField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { viewport, pointer } = useThree();

  // Reusable scratch objects (avoid per-frame allocation).
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const mouseWorld = useMemo(() => new THREE.Vector3(), []);

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: COUNT }, () => ({
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
  }, []);

  // Preallocate a line buffer sized for the worst case we'll actually draw.
  const maxSegments = COUNT * 6;
  const linePositions = useMemo(
    () => new Float32Array(maxSegments * 2 * 3),
    [maxSegments],
  );
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions, 3),
    );
    return geo;
  }, [linePositions]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

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
      if (
        p.position.z > BOUNDS / 2 ||
        p.position.z < -BOUNDS / 2
      ) {
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
    lineGeometry.setDrawRange(0, ptr / 3);
    lineGeometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.5} />
      </instancedMesh>
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial color="#1e293b" transparent opacity={0.6} />
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
