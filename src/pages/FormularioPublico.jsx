import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./VistaPreviaFormulario.css";

export default function FormularioPublico() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState(null);
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(true);
  // feedback corto para el usuario (subiendo archivo, error, etc.)
  const [msg, setMsg] = useState("");

  // bandera de envío
  const [enviando, setEnviando] = useState(false);

  // respuestas { [campoId]: string | string[] }
  const [respuestas, setRespuestas] = useState({});

  const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    (async () => {
      try {
        const [resF, resC] = await Promise.all([
          axios.get(`${API}/api/formularios/${id}`), // público
          axios.get(`${API}/api/formularios/${id}/campos`), // público
        ]);

        setFormulario(resF.data);

        const payload = resC.data;
        const lista = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload.campos)
          ? payload.campos
          : [];

        const normalizados = lista.map((c) => ({
          ...c,
          opciones: c.opciones
            ? Array.isArray(c.opciones)
              ? c.opciones
              : (() => {
                  try {
                    return JSON.parse(c.opciones);
                  } catch {
                    return [];
                  }
                })()
            : [],
        }));

        setCampos(normalizados);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, API]);

  // helpers de estado
  const setValor = (campoId, valor) =>
    setRespuestas((prev) => ({ ...prev, [campoId]: valor }));

  const toggleCheckbox = (campoId, opcion, checked) => {
    setRespuestas((prev) => {
      const arr = Array.isArray(prev[campoId]) ? prev[campoId] : [];
      const next = checked ? [...arr, opcion] : arr.filter((v) => v !== opcion);
      return { ...prev, [campoId]: next };
    });
  };

  const getAcceptTypes = (campo) => {
    const tipoArchivo = campo.opciones?.[0] || "todos";
    switch (tipoArchivo) {
      case "documentos":
        return ".pdf,.doc,.docx";
      case "imagenes":
        return ".jpg,.jpeg,.png";
      case "videos":
        return ".mp4,.mov";
      default:
        return ".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov";
    }
  };

  // ⤵️ CORREGIDO: usa `respuestas`, una sola bandera (`enviando`) y `API`
  const onSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const payload = { respuestas }; // <--- AQUÍ estaba el error (antes: values)

      await axios.post(`${API}/api/formularios/${id}/responder`, payload, {
        headers: { Accept: "application/json" },
      });

      // Redirige a la página de gracias
      navigate(`/formularios/${id}/gracias`, { replace: true });
    } catch (err) {
      console.error(err);
      alert("No se pudo enviar el formulario. Intenta nuevamente.");
      setEnviando(false);
    }
  };

  async function uploadArchivo(file) {
    const fd = new FormData();
    fd.append("file", file);

    const { data } = await axios.post(`${API}/api/upload`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (data?.url) return data;
    if (data?.path)
      return { url: `${API}/${String(data.path).replace(/^\/+/, "")}` };

    throw new Error("Respuesta de /api/upload no contiene 'url' ni 'path'");
  }

  const renderCampo = (campo) => {
    const common = {
      marginBottom: "14px",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    };
    const label = (
      <label style={{ fontWeight: 600, color: "#1a365d" }}>
        {campo.etiqueta}{" "}
        {campo.obligatorio ? <span style={{ color: "#dc2626" }}>*</span> : null}
      </label>
    );

    // ---- Helper: subir archivo al backend ----
    const API_BASE =
      import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

    /**
     * Sube un archivo al backend. Debes tener la ruta POST /api/upload activa.
     * Debe devolver algo como: { url: "http://127.0.0.1:8000/storage/uploads/archivo.pdf" }
     */

    switch (campo.tipo) {
      case "texto_corto":
        return (
          <div key={campo.id} style={common}>
            {label}
            <input
              type="text"
              value={respuestas[campo.id] || ""}
              onChange={(e) => setValor(campo.id, e.target.value)}
              required={campo.obligatorio}
              style={input}
            />
          </div>
        );
      case "texto_largo":
        return (
          <div key={campo.id} style={common}>
            {label}
            <textarea
              rows={4}
              value={respuestas[campo.id] || ""}
              onChange={(e) => setValor(campo.id, e.target.value)}
              required={campo.obligatorio}
              style={input}
            />
          </div>
        );
      case "numero":
        return (
          <div key={campo.id} style={common}>
            {label}
            <input
              type="number"
              value={respuestas[campo.id] || ""}
              onChange={(e) => setValor(campo.id, e.target.value)}
              required={campo.obligatorio}
              style={input}
            />
          </div>
        );
      case "fecha":
        return (
          <div key={campo.id} style={common}>
            {label}
            <input
              type="date"
              value={respuestas[campo.id] || ""}
              onChange={(e) => setValor(campo.id, e.target.value)}
              required={campo.obligatorio}
              style={input}
            />
          </div>
        );
      case "email":
        return (
          <div key={campo.id} style={common}>
            {label}
            <input
              type="email"
              value={respuestas[campo.id] || ""}
              onChange={(e) => setValor(campo.id, e.target.value)}
              required={campo.obligatorio}
              style={input}
            />
          </div>
        );
      case "telefono":
        return (
          <div key={campo.id} style={common}>
            {label}
            <input
              type="tel"
              value={respuestas[campo.id] || ""}
              onChange={(e) => setValor(campo.id, e.target.value)}
              required={campo.obligatorio}
              style={input}
            />
          </div>
        );
      case "direccion":
        return (
          <div key={campo.id} style={common}>
            {label}
            <input
              type="text"
              value={respuestas[campo.id] || ""}
              onChange={(e) => setValor(campo.id, e.target.value)}
              required={campo.obligatorio}
              style={input}
            />
          </div>
        );
      case "enlace":
        return (
          <div key={campo.id} style={common}>
            {label}
            <input
              type="url"
              value={respuestas[campo.id] || ""}
              onChange={(e) => setValor(campo.id, e.target.value)}
              required={campo.obligatorio}
              style={input}
            />
          </div>
        );
      case "archivo":
        return (
          <div key={campo.id} style={common}>
            {label}
            <input
              type="file"
              accept={getAcceptTypes(campo)}
              style={{ ...input, background: "#edf2f7" }}
              onChange={async (e) => {
                /* const file = e.target.files?.[0]; */
                const files = e.target.files;
                const file = files && files[0];
                if (!file) return;

                try {
                  setMsg("Subiendo archivo…");
                  const { url } = await uploadArchivo(file);
                  // Guarda la URL pública en las respuestas del campo:
                  setValor(campo.id, url);
                  setMsg("Archivo subido ✓");
                } catch (err) {
                  console.error(err);
                  setMsg("Error al subir el archivo");
                }
              }}
            />
            {/* Si ya hay URL guardada, muestra un enlace */}
            {respuestas[campo.id] && (
              <a
                href={respuestas[campo.id]}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#1a365d", marginTop: 6 }}
              >
                Ver archivo subido
              </a>
            )}
            <small style={{ color: "#2b6cb0" }}>
              Archivos permitidos:{" "}
              {getAcceptTypes(campo).replaceAll(".", "").replaceAll(",", ", ")}
            </small>
          </div>
        );

      case "checkbox":
        return (
          <div key={campo.id} style={common}>
            {label}
            <div style={{ display: "grid", gap: "6px" }}>
              {campo.opciones.map((op, i) => {
                const actual = Array.isArray(respuestas[campo.id])
                  ? respuestas[campo.id]
                  : [];
                const checked = actual.includes(op);
                return (
                  <label
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        toggleCheckbox(campo.id, op, e.target.checked)
                      }
                    />
                    {op}
                  </label>
                );
              })}
            </div>
            {campo.obligatorio && (
              <input
                type="hidden"
                required={campo.obligatorio}
                value={
                  Array.isArray(respuestas[campo.id]) &&
                  respuestas[campo.id].length
                    ? "ok"
                    : ""
                }
                onChange={() => {}}
              />
            )}
          </div>
        );
      case "radio":
        return (
          <div key={campo.id} style={common}>
            {label}
            <div style={{ display: "grid", gap: "6px" }}>
              {campo.opciones.map((op, i) => (
                <label
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="radio"
                    name={`radio-${campo.id}`}
                    value={op}
                    checked={respuestas[campo.id] === op}
                    onChange={() => setValor(campo.id, op)}
                    required={campo.obligatorio}
                  />
                  {op}
                </label>
              ))}
            </div>
          </div>
        );
      case "select":
        return (
          <div key={campo.id} style={common}>
            {label}
            <select
              value={respuestas[campo.id] || ""}
              onChange={(e) => setValor(campo.id, e.target.value)}
              required={campo.obligatorio}
              style={input}
            >
              <option value="">Selecciona una opción</option>
              {campo.opciones.map((op, i) => (
                <option key={i} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>
        );
      default:
        return (
          <div key={campo.id} style={common}>
            {label}
            <input
              type="text"
              value={respuestas[campo.id] || ""}
              onChange={(e) => setValor(campo.id, e.target.value)}
              required={campo.obligatorio}
              style={input}
            />
          </div>
        );
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Cargando…</div>;

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div>
          <h2 style={{ color: "#1a365d", marginBottom: 4 }}>
            {formulario?.titulo || "Formulario sin título"}
          </h2>
          {formulario?.descripcion && (
            <p
              style={{ color: "#1a365d", fontSize: "0.95rem", marginBottom: 0 }}
            >
              {formulario.descripcion}
            </p>
          )}
        </div>
        <Link
          to={`/formularios/${id}/preview`}
          style={{ color: "#1a365d", textDecoration: "none", fontWeight: 600 }}
        >
          Ver vista previa
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        style={{
          background: "#edf2f7",
          border: "1px solid #cbd2dcff",
          borderRadius: 12,
          padding: 16,
        }}
      >
        {campos.length === 0 ? (
          <p style={{ color: "#2b6cb0" }}>Aún no hay campos.</p>
        ) : (
          campos.map((c) => renderCampo(c))
        )}

        {msg && <div style={{ marginTop: 8, color: "#1a365d" }}>{msg}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            type="submit"
            disabled={enviando}
            style={{
              background: enviando ? "#1a365d" : "#2b6cb0",
              color: "#fff",
              padding: "10px 16px",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: enviando ? "not-allowed" : "pointer",
            }}
          >
            {enviando ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </form>
    </div>
  );
}

const input = {
  padding: "8px",
  border: "2px solid #90cdf4",
  borderRadius: "8px",
};
