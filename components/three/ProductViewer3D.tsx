"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Ürün detay sayfası için 360° 3D önizleme.
 *
 * ÖNEMLİ — PLACEHOLDER: Gerçek bir GLB ambalaj modeli henüz yok. Bunun
 * yerine ürünün gerçek fotoğrafı, basit bir kutu geometrisinin ön yüzüne
 * texture olarak uygulanmış hafif bir "mockup" gösteriliyor. İleride gerçek
 * bir GLB model hazır olduğunda:
 *   1. Modeli /public/models/ altına ekle
 *   2. Bu dosyadaki <ProductBox> bileşenini `useGLTF(path)` ile değiştir
 *   3. Diğer her şey (auto-rotate, sürükle-döndür, Suspense) aynı kalır
 *
 * Davranış: otomatik yavaş dönüş + kullanıcı sürükleyince manuel 360°
 * döndürme (sürükleme bırakılınca otomatik dönüşe geri döner).
 */

function ProductBox({ imageSrc }: { imageSrc: string }) {
  const texture = useLoader(THREE.TextureLoader, imageSrc);
  const groupRef = useRef<THREE.Group>(null);
  const dragState = useRef({ dragging: false, lastX: 0, velocity: 0 });

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    if (dragState.current.dragging) return;
    // Sürükleme bırakıldıktan sonra hafif bir "momentum" ile yavaşlayarak
    // otomatik dönüşe devam eder.
    dragState.current.velocity = THREE.MathUtils.lerp(dragState.current.velocity, 0.35, delta * 2);
    group.rotation.y += dragState.current.velocity * delta;
  });

  function onPointerDown(e: React.PointerEvent) {
    dragState.current.dragging = true;
    dragState.current.lastX = e.clientX;
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragState.current.dragging || !groupRef.current) return;
    const deltaX = e.clientX - dragState.current.lastX;
    groupRef.current.rotation.y += deltaX * 0.01;
    dragState.current.lastX = e.clientX;
  }
  function onPointerUp() {
    dragState.current.dragging = false;
    dragState.current.velocity = 0.05;
  }

  return (
    <group
      ref={groupRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <mesh castShadow>
        <boxGeometry args={[1.3, 2, 0.35]} />
        {/* Yüz sırası: +x, -x, +y, -y, +z (ön/etiket), -z */}
        <meshStandardMaterial attach="material-0" color="#3A2019" roughness={0.6} />
        <meshStandardMaterial attach="material-1" color="#3A2019" roughness={0.6} />
        <meshStandardMaterial attach="material-2" color="#56312D" roughness={0.6} />
        <meshStandardMaterial attach="material-3" color="#56312D" roughness={0.6} />
        <meshStandardMaterial attach="material-4" map={texture} roughness={0.5} />
        <meshStandardMaterial attach="material-5" color="#241310" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Loading3D() {
  return null;
}

export function ProductViewer3D({ imageSrc }: { imageSrc: string }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 3.4], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color="#FFF6F0" />
      <pointLight position={[-3, -2, 2]} intensity={0.3} color="#F9C89E" />
      <Suspense fallback={<Loading3D />}>
        <ProductBox imageSrc={imageSrc} />
      </Suspense>
    </Canvas>
  );
}
