import Link from "next/link";
import { Instagram } from "lucide-react";

const POSTS = [
  { image: "/images/hero-bars.jpg", caption: "Giresun fındığı — gerçek hammadde." },
  { image: "/images/boxes-right.jpg", caption: "Tiramisu & Kakao bar." },
  { image: "/images/cream-pour.jpg", caption: "%50 fındık oranıyla krema." },
  { image: "/images/lifestyle-waffle.jpg", caption: "Kahvaltıda venti-ate." },
  { image: "/images/boxes-left.jpg", caption: "Deneme paketi — ikisini birlikte dene." },
  { image: "/images/hand-bars.jpg", caption: "Çantana sığar, antrenmanı geçmez." },
];

export function InstagramGrid() {
  return (
    <section className="bg-[#2D1A0E] py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Instagram size={20} className="text-[#F9C89E]" />
            <span className="text-sm font-semibold text-[#FFF6F0]">@ventiate.co</span>
          </div>
          <Link href="https://instagram.com/ventiate.co.co" target="_blank" rel="noopener noreferrer"
            className="text-xs font-semibold uppercase tracking-widest text-[#F9C89E] hover:text-[#FFF6F0] transition-colors">
            Takip Et →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-1 md:grid-cols-6">
          {POSTS.map((post, i) => (
            <Link key={i} href="https://instagram.com/ventiate.co.co" target="_blank" rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-[#F9C89E]/10">
              <img src={post.image} alt={post.caption}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 flex items-center justify-center bg-[#56312D]/0 transition-all duration-300 group-hover:bg-[#56312D]/60">
                <Instagram size={24} className="text-[#FFF6F0] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
