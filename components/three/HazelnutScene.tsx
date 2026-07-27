"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

/**
 * React Three Fiber (https://github.com/pmndrs/react-three-fiber) üzerine
 * three.js (https://github.com/mrdoob/three.js) ile kurulmuş, hafif bir
 * 3D "fındık" sahnesi. Gerçek bir 3D model/texture kullanmıyor — kasıtlı:
 * lisanssız/harici bir varlık indirmek yerine basit geometrilerden
 * (icosahedron + torus) prosedürel olarak inşa edilmiş, markanın kahverengi/
 * yeşil paletine sadık, düşük maliyetli bir sahne.
 *
 * Performans: sadece Hero görünürken mount edilir (Hero.tsx dynamic import,
 * ssr:false), düşük poligon sayısı, tek sahne, DPR sınırlı.
 */

type NutProps = {
  position: [number, number, number];
  scale: number;
  speed: number;
  color: string;
};

function Nut({ position, scale, speed, color }: NutProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];

  useFrame(({ clock, mouse }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    mesh.rotation.x = t * speed * 0.3;
    mesh.rotation.y = t * speed * 0.4;
    mesh.position.y = initialY + Math.sin(t * speed + position[0]) * 0.25;
    // Kontrollü mouse parallax — sahneyi hafifçe fare yönüne kaydırır
    mesh.position.x = position[0] + mouse.x * 0.4;
    mesh.position.z = position[2] + mouse.y * 0.2;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale} castShadow>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.1} flatShading />
    </mesh>
  );
}

function Ring(props: ThreeElements["mesh"]) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * 0.05;
  });
  return (
    <mesh ref={ref} {...props}>
      <torusGeometry args={[2.6, 0.02, 8, 100]} />
      <meshBasicMaterial color="#F9C89E" transparent opacity={0.35} />
    </mesh>
  );
}

export function HazelnutScene() {
  const nuts = useMemo<NutProps[]>(
    () => [
      { position: [-1.8, 0.4, 0], scale: 0.55, speed: 0.4, color: "#56312D" },
      { position: [1.6, -0.3, -0.5], scale: 0.4, speed: 0.6, color: "#415D1F" },
      { position: [0.3, 0.9, -1], scale: 0.32, speed: 0.5, color: "#3A2019" },
      { position: [-0.9, -0.8, 0.3], scale: 0.26, speed: 0.7, color: "#5C7A34" },
    ],
    []
  );

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color="#FFF6F0" />
      <pointLight position={[-3, -2, 2]} intensity={0.4} color="#F9C89E" />
      <Ring rotation={[Math.PI / 2.4, 0, 0]} />
      {nuts.map((nut, i) => (
        <Nut key={i} {...nut} />
      ))}
    </Canvas>
  );
}
