"use client";

import Image from "next/image";

export default function OfflinePage() {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)",
          fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            maxWidth: "400px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 1.5rem",
              borderRadius: "1rem",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(40, 180, 133, 0.3)",
            }}
          >
            <Image
              src="/icons/icon-192x192.png"
              alt="Zenticare"
              width={80}
              height={80}
              style={{ display: "block" }}
            />
          </div>

          {/* Offline icon */}
          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 1.5rem",
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#1f2937",
              marginBottom: "0.75rem",
            }}
          >
            Sin conexión
          </h1>

          <p
            style={{
              fontSize: "1rem",
              color: "#6b7280",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            No pudimos conectar con Zenticare. Verifica tu conexión a internet e
            inténtalo de nuevo.
          </p>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.75rem 2rem",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#ffffff",
              backgroundColor: "#28B485",
              border: "none",
              borderRadius: "0.75rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(40, 180, 133, 0.4)",
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "#20A77D";
              (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "#28B485";
              (e.target as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
