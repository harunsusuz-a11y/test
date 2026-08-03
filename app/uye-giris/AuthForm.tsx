"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/ui/PageHeader";

type Mode = "login" | "register" | "reset";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage({ type: "error", text: "E-posta veya şifre hatalı." });
      else { router.push("/hesabim"); router.refresh(); }
    } else if (mode === "register") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage({ type: "error", text: error.message });
      else setMessage({ type: "success", text: "Kayıt başarılı! E-postanızı doğrulayın." });
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/hesabim`,
      });
      if (error) setMessage({ type: "error", text: error.message });
      else setMessage({ type: "success", text: "Şifre sıfırlama bağlantısı e-postanıza gönderildi." });
    }

    setLoading(false);
  }

  return (
    <>
      <PageHeader eyebrow="Hesabım" title={mode === "login" ? "Giriş Yap" : mode === "register" ? "Üye Ol" : "Şifremi Unuttum"} />
      <div className="mx-auto max-w-md px-5 py-16">
        <div className="rounded-2xl border border-brown/10 bg-white/70 p-8">
          {/* Mod seçici */}
          <div className="mb-6 flex rounded-xl border border-brown/10 p-1">
            <button type="button" onClick={() => setMode("login")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${mode === "login" ? "bg-brown-darker text-cream" : "text-brown-dark hover:text-brown-darker"}`}>
              Giriş Yap
            </button>
            <button type="button" onClick={() => setMode("register")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${mode === "register" ? "bg-brown-darker text-cream" : "text-brown-dark hover:text-brown-darker"}`}>
              Üye Ol
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-brown-dark">E-posta</label>
              <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-brown/20 bg-white px-4 py-3 text-sm outline-none focus-visible:border-green"
                placeholder="ornek@mail.com" />
            </div>
            {mode !== "reset" && (
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-brown-dark">Şifre</label>
                <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-brown/20 bg-white px-4 py-3 text-sm outline-none focus-visible:border-green"
                  placeholder="••••••••" />
              </div>
            )}
            {message && (
              <p className={`rounded-xl px-4 py-3 text-sm ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-green/10 text-green"}`}>
                {message.text}
              </p>
            )}
            <button type="submit" disabled={loading}
              className="btn-signature w-full bg-brown-darker py-4 text-sm font-bold text-cream transition hover:bg-green disabled:opacity-60">
              {loading ? "İşleniyor…" : mode === "login" ? "Giriş Yap" : mode === "register" ? "Üye Ol" : "Bağlantı Gönder"}
            </button>
          </form>

          {mode === "login" && (
            <button type="button" onClick={() => setMode("reset")}
              className="mt-4 w-full text-center text-xs text-brown-dark/50 hover:text-brown-darker underline-offset-2 hover:underline">
              Şifremi unuttum
            </button>
          )}
        </div>
      </div>
    </>
  );
}
