"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { Box, ZoomIn } from "lucide-react";

const ProductViewer3D = dynamic(
  () => import("@/components/three/ProductViewer3D").then((m) => m.ProductViewer3D),
  { ssr: false }
);

/**
 * Premium ürün galerisi:
 * - Thumbnail'lar interaktif: tıklayınca ana görsel crossfade ile değişir
 * - Desktop'ta imleci takip eden hover zoom (transform-origin fare konumunda)
 * - 360° placeholder viewer korunur
 * Zoom yalnızca hover'lı cihazlarda ve reduced-motion kapalıyken aktif olur.
 */
export function ProductGallery({
  image,
  gallery,
  name,
  isDemo,
}: {
  image: string;
  gallery: string[];
  name: string;
  isDemo: boolean;
}) {
  const [show3d, setShow3d] = useState(false);
  const [active, setActive] = useState(image);
  const [zooming, setZooming] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState("50% 50%");

  // Ana görsel + galerinin tekilleştirilmiş listesi
  const allImages = [image, ...gallery.filter((src) => src !== image)];

  function canZoom() {
    return (
      window.matchMedia("(hover: hover)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!zooming) return;
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div>
      <div
        ref={frameRef}
        onPointerEnter={() => setZooming(!show3d && canZoom())}
        onPointerLeave={() => setZooming(false)}
        onPointerMove={handleMove}
        className={`group relative aspect-square overflow-hidden rounded-2xl bg-brown/5 ${
          !show3d ? "cursor-zoom-in" : ""
        }`}
      >
        {show3d ? (
          <ProductViewer3D imageSrc={image} />
        ) : (
          // Crossfade: tüm görseller mount edilir, yalnızca aktif olan görünür.
          // Böylece geçişte yükleme boşluğu oluşmaz.
          allImages.map((src) => (
            <Image
              key={src}
              src={src}
              alt={src === active ? name : ""}
              aria-hidden={src !== active || undefined}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              priority={src === image}
              style={src === active && zooming ? { transformOrigin: origin } : undefined}
              className={`object-cover transition-all duration-500 ease-out motion-reduce:transition-none ${
                src === active ? "opacity-100" : "opacity-0"
              } ${src === active && zooming ? "scale-[1.7]" : "scale-100"}`}
            />
          ))
        )}

        {isDemo && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-brown-darker/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cream">
            Demo İçerik
          </span>
        )}

        {!show3d && (
          <span className="pointer-events-none absolute left-4 bottom-4 z-10 hidden items-center gap-1.5 rounded-full bg-brown-darker/60 px-3 py-1.5 text-[11px] font-semibold text-cream opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 md:flex motion-reduce:hidden">
            <ZoomIn size={12} aria-hidden="true" />
            Yakınlaştırmak için gezdir
          </span>
        )}

        <button
          type="button"
          onClick={() => {
            setShow3d((v) => !v);
            setZooming(false);
          }}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-cream/95 px-4 py-2 text-xs font-bold text-brown-darker shadow-md transition hover:bg-cream"
          aria-pressed={show3d}
        >
          <Box size={14} aria-hidden="true" />
          {show3d ? "Fotoğrafa Dön" : "360° İncele"}
        </button>
      </div>

      {show3d && (
        <p className="mt-2 text-xs text-brown-dark/50">
          Sürükleyerek döndürebilirsin. Not: bu, gerçek ambalajın 3D taramasi değil — placeholder bir mockup&apos;tır;
          gerçek ürün modeli hazır olduğunda değiştirilecektir.
        </p>
      )}

      {allImages.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3" role="tablist" aria-label="Ürün görselleri">
          {allImages.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={src === active}
              aria-label={`Görsel ${i + 1}`}
              onClick={() => {
                setActive(src);
                setShow3d(false);
              }}
              className={`relative aspect-square overflow-hidden rounded-xl bg-brown/5 transition-all duration-300 ${
                src === active && !show3d
                  ? "ring-2 ring-green ring-offset-2 ring-offset-cream"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="150px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
