"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Box } from "lucide-react";

const ProductViewer3D = dynamic(
  () => import("@/components/three/ProductViewer3D").then((m) => m.ProductViewer3D),
  { ssr: false }
);

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

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-brown/5">
        {show3d ? (
          <ProductViewer3D imageSrc={image} />
        ) : (
          <Image src={image} alt={name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" priority />
        )}

        {isDemo && (
          <span className="absolute left-4 top-4 rounded-full bg-brown-darker/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cream">
            Demo İçerik
          </span>
        )}

        <button
          type="button"
          onClick={() => setShow3d((v) => !v)}
          className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-cream/95 px-4 py-2 text-xs font-bold text-brown-darker shadow-md transition hover:bg-cream"
          aria-pressed={show3d}
        >
          <Box size={14} aria-hidden="true" />
          {show3d ? "Fotoğrafa Dön" : "360° İncele"}
        </button>
      </div>

      {show3d && (
        <p className="mt-2 text-xs text-brown-dark/50">
          Sürükleyerek döndürebilirsin. Not: bu, gerçek ambalajın 3D taramasi değil — placeholder bir mockup'tır;
          gerçek ürün modeli hazır olduğunda değiştirilecektir.
        </p>
      )}

      {gallery.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {gallery.map((src) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-xl bg-brown/5">
              <Image src={src} alt="" fill sizes="200px" className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
