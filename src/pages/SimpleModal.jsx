// pages/SimpleModal.jsx
import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function SimpleModal({
  isOpen,
  title,
  children,
  onAccept,
  onClose,
  acceptText = "Aceptar",
  acceptDisabled = false,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Colores desde variables CSS si existen, con fallback a tu paleta
  const VAR = (name, fallback) => `var(${name}, ${fallback})`;
  const COLOR_PRIMARY = VAR("--color-primary", "#2b6cb0");
  const COLOR_DARK = VAR("--color-dark", "#1a365d");
  const COLOR_GRAY = VAR("--color-gray", "#718096");
  const COLOR_GRAY_LIGHT = VAR("--color-gray-light", "#e2e8f0");
  const COLOR_WHITE = VAR("--color-white", "#ffffff");

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px", // respiración en móviles
      }}
    >
      {/* Backdrop con ligero blur */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(26, 32, 44, 0.55)", // dark 55%
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Caja del modal */}
      <div
        style={{
          position: "relative",
          width: "min(680px, 92vw)",
          maxHeight: "85vh",
          overflow: "auto",
          background: COLOR_WHITE,
          borderRadius: "20px",
          boxShadow:
            "0 20px 50px rgba(0,0,0,.25), 0 2px 10px rgba(0,0,0,.08)",
          border: `1px solid ${COLOR_GRAY_LIGHT}`,
          transform: "translateY(0)",
          transition: "transform 160ms ease, opacity 160ms ease",
          opacity: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px",
            borderBottom: `1px solid ${COLOR_GRAY_LIGHT}`,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: COLOR_DARK,
              letterSpacing: ".2px",
            }}
          >
            {title}
          </h3>
        </div>

        {/* Contenido */}
        <div style={{ padding: "18px 20px" }}>{children}</div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: `1px solid ${COLOR_GRAY_LIGHT}`,
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: `1px solid ${COLOR_PRIMARY}`,
              background: "transparent",
              color: COLOR_PRIMARY,
              fontWeight: 600,
              cursor: "pointer",
              outline: "none",
            }}
          >
            Cancelar
          </button>

          <button
            onClick={onAccept}
            disabled={acceptDisabled}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "none",
              background: acceptDisabled ? COLOR_GRAY_LIGHT : COLOR_PRIMARY,
              color: acceptDisabled ? COLOR_GRAY : "#fff",
              fontWeight: 700,
              cursor: acceptDisabled ? "not-allowed" : "pointer",
              outline: "none",
              boxShadow: acceptDisabled
                ? "none"
                : "0 6px 14px rgba(43,108,176,0.35)",
            }}
          >
            {acceptText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
