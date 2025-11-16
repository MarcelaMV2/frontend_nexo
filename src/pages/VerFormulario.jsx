import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  if (payload?.campos && Array.isArray(payload.campos)) return payload.campos;
  return [];
};

export default function VerFormulario() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [formulario, setFormulario] = useState(null);
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [urlFormulario, setUrlFormulario] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      try {
        console.log("Token enviado:", token);

        const [resForm, resCampos] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/formularios/${id}`,
            {
              //axios.get(`http://127.0.0.1:8000/api/formularios/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
              Accept: "application/json",
            }
          ),
          axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/formularios/${id}/campos`,
            {
              //axios.get(`http://127.0.0.1:8000/api/formularios/${id}/campos`, {
              headers: { Authorization: `Bearer ${token}` },
              Accept: "application/json",
            }
          ),
        ]);

        if (!mounted) return;

        setFormulario(resForm.data || null);

        // Normaliza lista de campos y sus opciones sin romper si ya son array
        const lista = toArray(resCampos.data).map((c) => {
          let opciones = c.opciones;
          if (typeof opciones === "string") {
            try {
              opciones = JSON.parse(opciones);
            } catch {
              opciones = [];
            }
          }
          if (!Array.isArray(opciones)) opciones = [];
          return { ...c, opciones };
        });

        setCampos(lista);
      } catch (e) {
        console.error("Error al cargar 'Ver formulario':", e);
        setErrorMsg("No se pudo cargar el formulario.");
        setFormulario(null);
        setCampos([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, [id, token]);

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>;
  if (errorMsg)
    return <div style={{ padding: 24, color: "#b91c1c" }}>{errorMsg}</div>;
  if (!formulario)
    return <div style={{ padding: 24 }}>Formulario no encontrado.</div>;

  function BotonCopiar({ texto, onClose }) {
    const [copiado, setCopiado] = useState(false);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => {
          setCopiado(false);
          onClose(); // Cierra el modal después de 2 segundos
        }, 2000);
      } catch (err) {
        console.error("Error al copiar:", err);
      }
    };

    return (
      <button
        onClick={handleCopy}
        style={{
          background: "transparent",
          border: "none",
          color: copiado ? "#060606ff" : "#1a365d",
          fontWeight: "600",
          cursor: "pointer",
          marginLeft: "10px",
          transition: "color 0.3s ease",
        }}
      >
        {copiado ? "Copiado" : "Copiar"}
      </button>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ color: "#1a365d", margin: 0 }}>
            {formulario.titulo || "Formulario sin título"}
          </h1>
          {formulario.descripcion && (
            <p style={{ color: "#1a365d", marginTop: 6 }}>
              {formulario.descripcion}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            to={`/dashboard/formulario/${id}/campos`}
            style={{
              background: "#1a365d",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Editar formulario
          </Link>

          <Link
            to={`/dashboard/formulario/${id}/condiciones`}
            style={{
              background: "#1a365d",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Condiciones del Formulario
          </Link>

          <button
            onClick={() => {
              //const link = `${window.location.origin}/formularios/${id}/preview`;
              const link = `${window.location.origin}/formularios/${id}`;
              setUrlFormulario(link);
              setMostrarModal(true);
            }}
            style={{
              background: "#1a365d",
              color: "white",
              padding: "8px 12px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Copiar URL
          </button>
        </div>
      </div>

      {/* Lista de preguntas */}
      <div
        style={{
          //background: "#e2e8f0",
          border: "1px solid #2b6cb0",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h3 style={{ color: "#1a365d", marginTop: 0 }}>
          Preguntas del formulario
        </h3>
        {campos.length === 0 ? (
          <p style={{ color: "#1a365d" }}>Aún no hay campos.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {campos.map((campo, i) => (
              <li
                key={campo.id ?? `${campo.etiqueta}-${i}`}
                style={{
                  background: "#e2e8f0",
                  borderRadius: 8,
                  padding: "10px 12px",
                  marginBottom: 8,
                }}
              >
                <b>{`Pregunta ${i + 1}:`}</b> {campo.etiqueta}{" "}
                {campo.obligatorio ? (
                  <span style={{ color: "#b91c1c" }}>(obligatorio)</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {mostrarModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "35px 40px",
              width: "600px", // más ancho
              boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
              position: "relative",
              textAlign: "center",
            }}
          >
            {/* Botón de cierre (X) arriba a la derecha */}
            <button
              onClick={() => setMostrarModal(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "20px", 
                background: "transparent",
                border: "none",
                fontSize: "20px",
                color: "#1a365d",
                cursor: "pointer",
              }}
            >
              ✕
            </button>

            <h3
              style={{
                color: "#1a365d",
                marginBottom: "25px",
                fontSize: "20px",
              }}
            >
              Enlace del Formulario
            </h3>

            {/* Caja del enlace y botón copiar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "2px solid #1a365d",
                borderRadius: "10px",
                padding: "10px 14px",
                background: "#e2e8f0",
              }}
            >
              <input
                type="text"
                readOnly
                value={urlFormulario}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "15px",
                  color: "#1a365d",
                  background: "transparent",
                }}
              />
              <BotonCopiar
                texto={urlFormulario}
                onClose={() => setMostrarModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
