"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "venti-announcement-dismissed-v2";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("🎉 İlk siparişinde %10 indirim: VENTI10");
  const [link, setLink] = useState<string | null>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    fetch("/api/settings/content?keys=announcement_bar_text,announcement_bar_active,announcement_bar_link")
      .then((r) => r.json())
      .then((data) => {
        if (data.announcement_bar_active === false) return;
        if (data.announcement_bar_text) setText(data.announcement_bar_text);
        if (data.announcement_bar_link) setLink(data.announcement_bar_link);
        setVisible(true);
      })
      .catch(() => setVisible(true));
  }, []);

  if (!visible) return null;

  const inner = (
    <div className="flex items-center justify-center gap-3">
      <span className="text-xs font-medium tracking-wide text-cream">{text}</span>
      <button
        onClick={() => { localStorage.setItem(STORAGE_KEY, "1"); setVisible(false); }}
        className="ml-2 p-0.5 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Kapat"
      >
        <X className="w-3 h-3 text-cream/70" />
      </button>
    </div>
  );

  return (
    <div className="w-full bg-brown py-2 px-4">
      {link ? <a href={link} className="block">{inner}</a> : inner}
    </div>
  );
}
