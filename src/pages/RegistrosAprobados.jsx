import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function RespuestasFormulario() {
  const { id } = useParams();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(1);
  const [porPagina] = useState(10);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchRespuestas = async () => {
      try {
        const token = localStorage.getItem("token");
        const API =
          import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
        const res = await axios.get(
          `${API}/api/formularios/${id}/resumen-respuestas`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDatos(res.data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las respuestas");
      }
    };
    fetchRespuestas();
  }, [id]);

  if (error) return <p className="text-red-500 text-center mt-5">{error}</p>;
  if (!datos)
    return (
      <p className="text-center mt-5 text-gray-600">Cargando respuestas...</p>
    );

  // paginación
  const totalPaginas = Math.ceil(datos.respuestas.length / porPagina);
  const inicio = (pagina - 1) * porPagina;
  const fin = inicio + porPagina;
  const filasPagina = datos.respuestas.slice(inicio, fin);

  // ====== CONSTANTES PARA FORZAR EL SCROLL EN EL BLOQUE ======
  const COL_MIN = 200; // ancho mínimo por columna (ajústalo si quieres)
  const TABLE_MIN_PX = Math.max((datos.columnas?.length || 1) * COL_MIN, 1000);
  // ===========================================================

  const headerClamp = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "normal",
  };
  const cellClamp = {
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "normal",
  };

  // Render de una CELDA
  // Render de una CELDA (robusto para archivos)
  // Normaliza a una URL absoluta si el valor representa un archivo.
  // Devuelve null si no pudo construir una URL.
  function normalizeFileUrl(raw) {
    console.log("[render] valor crudo:", raw, "typeof:", typeof raw);

    // a) arrays => no es archivo, lo resuelve el caller
    if (Array.isArray(raw)) return null;

    let v = raw;

    // b) si viene string JSON, intenta parsear
    if (typeof v === "string") {
      const s = v.trim();

      // ¿ya es absoluta?
      if (/^https?:\/\//i.test(s)) return s;

      // ¿es relativa a storage?
      if (s.startsWith("/storage/") || s.startsWith("storage/")) {
        const rel = s.startsWith("/") ? s : `/${s}`;
        return `${API_BASE}${rel}`;
      }

      // ¿tiene pinta de JSON con url/path?
      if (s.startsWith("{") && s.endsWith("}")) {
        try {
          const obj = JSON.parse(s);
          if (obj?.url && /^https?:\/\//i.test(obj.url)) return obj.url;
          if (obj?.path) {
            const rel = obj.path.startsWith("/") ? obj.path : `/${obj.path}`;
            return `${API_BASE}${rel}`;
          }
        } catch (e) {
          console.log("[render] JSON.parse falló:", e);
        }
      }

      // nada reconocible
      return null;
    }

    // c) si viene objeto
    if (v && typeof v === "object") {
      if (v.url && /^https?:\/\//i.test(v.url)) return v.url;
      if (v.path) {
        const rel = v.path.startsWith("/") ? v.path : `/${v.path}`;
        return `${API_BASE}${rel}`;
      }
    }

    return null;
  }

  // Render de una CELDA (robusto para archivos) + LOGS
  const renderCelda = (valor) => {
    // 1) arrays (checkboxes)
    if (Array.isArray(valor)) {
      return valor.length ? valor.join(", ") : "—";
    }

    // 2) intenta normalizar a url de archivo
    const href = normalizeFileUrl(valor);
    if (href) {
      const nombre = decodeURIComponent(href.split("/").pop() || "Archivo");
      console.log("[render] URL detectada:", href);
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-purple-700 underline"
          title={href}
        >
          {nombre}
        </a>
      );
    }

    // 3) texto normal
    const s = (valor ?? "").toString().trim();
    return s ? (
      <div
        title={s}
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "normal",
        }}
      >
        {s}
      </div>
    ) : (
      "—"
    );
  };

  return (
    // evita que el body herede scroll horizontal
    <div className="p-6" style={{ overflowX: "hidden" }}>
      <h2 className="text-2xl font-bold text-purple-700 mb-4">
        Respuestas del Formulario #{id}
      </h2>

      {/* BLOQUE SCROLLER: el scroll vive AQUÍ */}
      <div
        className="border border-purple-200 rounded-2xl shadow-sm"
        style={{
          width: "100%",
          maxWidth: "100%",
          height: "50vh", // altura fija del bloque (barra visible si hay overflow)
          overflowX: "auto", // scroll horizontal SOLO del bloque
          overflowY: "auto", // scroll vertical SOLO del bloque
          position: "relative",
        }}
      >
        <table
          className="text-sm"
          style={{
            minWidth: TABLE_MIN_PX + "px", // fuerza a que la tabla sea más ancha que el bloque
            width: "max-content",
            borderCollapse: "separate",
            borderSpacing: 0,
            border: "1px solid #e9d5ff",
            tableLayout: "fixed",
          }}
        >
          <thead className="bg-purple-100 text-purple-900 sticky top-0 z-10">
            <tr>
              {datos.columnas.map((col, i) => (
                <th
                  key={i}
                  className="px-4 py-2 text-left font-semibold border-b border-purple-200"
                  style={{
                    minWidth: COL_MIN,
                    backgroundColor: "#2b6cb0",
                    borderRight: "1px solid #564e5fff",
                    color: "#fff",
                  }}
                >
                  <div title={col} style={headerClamp}>
                    {col}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filasPagina.length > 0 ? (
              filasPagina.map((fila, i) => (
                <tr
                  key={i}
                  className={`hover:bg-purple-50 transition ${
                    i % 2 === 0 ? "bg-white" : "bg-purple-50/30"
                  }`}
                >
                  {fila.map((valor, j) => (
                    <td
                      key={j}
                      className="px-4 py-2 border-b border-purple-100 align-top"
                      style={{
                        minWidth: COL_MIN,
                        borderRight: "1px solid #f1e8ff",
                      }}
                    >
                      {renderCelda(valor)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={datos.columnas.length}
                  className="text-center py-4 text-gray-500 italic"
                >
                  Aún no hay respuestas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className={`px-3 py-1 rounded-md ${
              pagina === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            ← Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {pagina} de {totalPaginas}
          </span>
          <button
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            className={`px-3 py-1 rounded-md ${
              pagina === totalPaginas
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            Siguiente →
          </button>
        </div>
      )}

      <div className="flex justify-end mt-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          style={{
            backgroundColor: "#2b6cb0",
            color: "#fff",
          }}
        >
          Actualizar
        </button>
      </div>
    </div>
  );
}
