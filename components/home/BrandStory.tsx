"use client";

import { useState, useEffect } from "react";

export function BrandStory() {
  const [story, setStory] = useState(
    "Venti-Ate, Giresun fındığını merkeze alan premium bir atıştırmalık markasıdır. Hem lezzetli hem fonksiyonel — günlük protein ihtiyacını karşılarken gerçek malzeme kalitesini korur."
  );

  useEffect(() => {
    fetch("/api/settings/content?keys=brand_short_story")
      .then((r) => r.json())
      .then((d) => { if (d.brand_short_story) setStory(d.brand_short_story); })
      .catch(() => {});
  }, []);

  return (
    <section className="py-24 px-6 bg-cream">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <p className="text-xs uppercase tracking-widest text-brown/50">Hikayemiz</p>
        <p className="font-display text-2xl md:text-3xl text-brown leading-relaxed">{story}</p>
      </div>
    </section>
  );
}
