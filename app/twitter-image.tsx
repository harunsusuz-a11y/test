import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Venti-Ate — Fındığın rafine hali";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background: "#56312D",
          padding: "72px 80px",
          fontFamily: "serif",
        }}
      >
        {/* Arka plan doku katmanı */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 80% 20%, #415D1F 0%, transparent 55%), radial-gradient(ellipse at 10% 80%, #F9C89E22 0%, transparent 50%)",
          }}
        />

        {/* Marka adı */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#F9C89E",
              fontFamily: "sans-serif",
            }}
          >
            VENTI-ATE
          </div>

          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#FFF6F0",
              lineHeight: 1.1,
              maxWidth: "700px",
            }}
          >
            Fındığın rafine hali.
          </div>

          <div
            style={{
              fontSize: "24px",
              color: "#FFF6F088",
              fontFamily: "sans-serif",
              fontWeight: 400,
              marginTop: "8px",
              maxWidth: "600px",
              lineHeight: 1.5,
            }}
          >
            Giresun fındığından protein bar ve fındık kreması.
          </div>
        </div>

        {/* Sağ taraf aksan */}
        <div
          style={{
            position: "absolute",
            right: "80px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "12px",
          }}
        >
          <div
            style={{
              background: "#415D1F",
              borderRadius: "100px",
              padding: "12px 24px",
              color: "#FFF6F0",
              fontSize: "18px",
              fontWeight: 700,
              fontFamily: "sans-serif",
            }}
          >
            %25 Protein
          </div>
          <div
            style={{
              background: "#F9C89E22",
              border: "1px solid #F9C89E44",
              borderRadius: "100px",
              padding: "12px 24px",
              color: "#FFF6F0",
              fontSize: "18px",
              fontWeight: 700,
              fontFamily: "sans-serif",
            }}
          >
            %50 Fındık Kreması
          </div>
          <div
            style={{
              background: "#F9C89E22",
              border: "1px solid #F9C89E44",
              borderRadius: "100px",
              padding: "12px 24px",
              color: "#FFF6F0",
              fontSize: "18px",
              fontWeight: 700,
              fontFamily: "sans-serif",
            }}
          >
            Giresun Fındığı
          </div>
        </div>

        {/* Alt çizgi */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "80px",
            fontSize: "14px",
            color: "#FFF6F044",
            fontFamily: "sans-serif",
          }}
        >
          ventiate.com
        </div>
      </div>
    ),
    { ...size }
  );
}
