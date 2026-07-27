"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * React Three Fiber (https://github.com/pmndrs/react-three-fiber) üzerine
 * three.js (https://github.com/mrdoob/three.js) ile kurulmuş, hafif bir
 * 3D "fındık" sahnesi. Gerçek bir 3D model/texture kullanmıyor — kasıtlı:
 * lisanssız/harici bir varlık indirmek yerine basit geometrilerden
 * (icosahedron) prosedürel olarak inşa edilmiş bir sahne.
 *
 * v2 düzeltmesi: İlk versiyonda nesneler koyu kahverengi tonlardaydı ve
 * koyu Hero arka planının üzerinde neredeyse görünmüyordu. Şimdi:
 * - Gerçek fındık kabuğuna yakın, AÇIK ve SICAK tonlar kullanılıyor (koyu
 *   arka planla kontrast oluşturur)
 * - Her nesnede hafif emissive (kendinden ışıma) var — karanlık sahnede
 *   bile "sönük" görünmez
 * - Daha güçlü, sıcak renkli key light + rim light eklendi
 * - Nesneler biraz büyütüldü
 *
 * Tasarım notu: nesneler bilinçli olarak sahnenin SAĞ/ÜST yarısında
 * tutulur — Hero metni ve CTA'lar sol-alt köşede olduğu için içerikle
 * çakışmaz, okunabilirliği bozmaz.
 */

type NutProps = {
  position: [number, number, number];
  scale: number;
  speed: number;
  color: string;
  emissive: string;
};

function Nut({ position, scale, speed, color, emissive }: NutProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];

  useFrame(({ clock, mouse }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    mesh.rotation.x = t * speed * 0.25;
    mesh.rotation.y = t * speed * 0.35;
    mesh.position.y = initialY + Math.sin(t * speed + position[0]) * 0.2;
    mesh.position.x = position[0] + mouse.x * 0.25;
    mesh.position.z = position[2] + mouse.y * 0.15;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.35}
        roughness={0.4}
        metalness={0.15}
        flatShading
      />
    </mesh>
  );
}

export function HazelnutScene() {
  // Gerçek fındık kabuğu tonları: altın-tan, bal rengi, sıcak bakır —
  // hepsi Hero'nun koyu kahverengi arka planından belirgin şekilde açık.
  const nuts = useMemo<NutProps[]>(
    () => [
      { position: [2.2, 0.6, -0.3], scale: 0.5, speed: 0.35, color: "#D9A15C", emissive: "#8A5A24" },
      { position: [3.1, -0.2, -0.8], scale: 0.36, speed: 0.5, color: "#C68B4F", emissive: "#7A4A1E" },
      { position: [2.5, 1.35, 0.2], scale: 0.28, speed: 0.55, color: "#F0C08A", emissive: "#9C6A2E" },
      { position: [3.4, 0.9, -0.4], scale: 0.2, speed: 0.65, color: "#F9C89E", emissive: "#B37B3E" },
    ],
    []
  );

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={1.8} color="#FFF6F0" />
      <directionalLight position={[-2, 1, 3]} intensity={0.6} color="#F9C89E" />
      <pointLight position={[2, -1, 2]} intensity={0.5} color="#F9C89E" />
      {nuts.map((nut, i) => (
        <Nut key={i} {...nut} />
      ))}
    </Canvas>
  );
}
