"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * React Three Fiber (https://github.com/pmndrs/react-three-fiber) üzerine
 * three.js (https://github.com/mrdoob/three.js) ile kurulmuş, hafif bir
 * 3D "fındık" sahnesi. Gerçek bir 3D model/texture kullanmıyor — kasıtlı:
 * lisanssız/harici bir varlık indirmek yerine basit geometrilerden
 * (icosahedron) prosedürel olarak inşa edilmiş, markanın kahverengi/
 * yeşil paletine sadık, düşük maliyetli bir sahne.
 *
 * Tasarım notu: nesneler bilinçli olarak sahnenin SAĞ/ÜST yarısında
 * tutulur — Hero metni ve CTA'lar sol-alt köşede olduğu için içerikle
 * çakışmaz, okunabilirliği bozmaz.
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
    mesh.rotation.x = t * speed * 0.25;
    mesh.rotation.y = t * speed * 0.35;
    mesh.position.y = initialY + Math.sin(t * speed + position[0]) * 0.2;
    // Çok kontrollü mouse parallax — abartılı kaymayı önlemek için küçük katsayı
    mesh.position.x = position[0] + mouse.x * 0.25;
    mesh.position.z = position[2] + mouse.y * 0.15;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color={color} roughness={0.65} metalness={0.05} flatShading />
    </mesh>
  );
}

export function HazelnutScene() {
  // Sahnenin sağ yarısında (x > 0.4), metin bloğunun (sol-alt) dışında konumlandı.
  const nuts = useMemo<NutProps[]>(
    () => [
      { position: [2.2, 0.6, -0.3], scale: 0.42, speed: 0.35, color: "#56312D" },
      { position: [3.1, -0.2, -0.8], scale: 0.3, speed: 0.5, color: "#3A2019" },
      { position: [2.5, 1.3, 0.2], scale: 0.22, speed: 0.55, color: "#5C7A34" },
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
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={1} color="#FFF6F0" />
      <pointLight position={[2, -1, 2]} intensity={0.35} color="#F9C89E" />
      {nuts.map((nut, i) => (
        <Nut key={i} {...nut} />
      ))}
    </Canvas>
  );
}
