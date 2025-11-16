import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SimpleModal from "./SimpleModal";

function resolveRespuestaId(
  datos,
  iPagina,
  pagina,
  porPagina,
  respuestasPaginaLen
) {
  if (!datos) return null;

  // 1) Arreglos de IDs (nombres comunes)
  const pools = [
    datos.respuesta_ids,
    datos.respuestaIds,
    datos.ids_respuestas,
    datos.ids,
    datos.respuestas_ids,
  ].filter(Array.isArray);

  for (const arr of pools) {
    const idsPaginados =
      arr.length === respuestasPaginaLen && respuestasPaginaLen > 0;
    const idx = idsPaginados ? iPagina : (pagina - 1) * porPagina + iPagina;
    if (Number.isInteger(arr[idx])) return arr[idx];
    // si vinieran como strings numéricas
    if (arr[idx] != null && !isNaN(Number(arr[idx]))) return Number(arr[idx]);
  }

  // 2) Si el backend trae objetos con id en otro arreglo paralelo
  const objPools = [
    datos.respuestas_obj,
    datos.respuestas_raw,
    datos.items,
    datos.data,
  ].filter(Array.isArray);

  for (const arr of objPools) {
    const idsPaginados =
      arr.length === respuestasPaginaLen && respuestasPaginaLen > 0;
    const idx = idsPaginados ? iPagina : (pagina - 1) * porPagina + iPagina;
    const row = arr[idx];
    if (row && typeof row === "object") {
      if (Number.isInteger(row.id)) return row.id;
      if (Number.isInteger(row.respuesta_id)) return row.respuesta_id;
      if (row.id != null && !isNaN(Number(row.id))) return Number(row.id);
      if (row.respuesta_id != null && !isNaN(Number(row.respuesta_id)))
        return Number(row.respuesta_id);
    }
  }

  // 3) Si el id viniera metido en un "meta" u objeto similar
  if (datos.meta?.ids && Array.isArray(datos.meta.ids)) {
    const arr = datos.meta.ids;
    const idsPaginados =
      arr.length === respuestasPaginaLen && respuestasPaginaLen > 0;
    const idx = idsPaginados ? iPagina : (pagina - 1) * porPagina + iPagina;
    if (Number.isInteger(arr[idx])) return arr[idx];
  }

  return null;
}

export default function RespuestasFormulario() {
  const { id } = useParams();

  // === URL & navegación ===
  const location = useLocation();
  const navigate = useNavigate();
  const qs = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const estado = qs.get("estado"); // "aprobado" | "rechazado" | null
  const pageFromUrl = parseInt(qs.get("page") || "1", 10);

  // === Estado local ===
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(isNaN(pageFromUrl) ? 1 : pageFromUrl);
  const [porPagina] = useState(10);
  // === UI Entrevistas (solo estado local, sin API aún) ===
  // No leemos el valor por ahora, solo el setter:
  const [showModalOne, setShowModalOne] = useState(false);
  const [showModalDay, setShowModalDay] = useState(false);
  const [rowSeleccionada, setRowSeleccionada] = useState(null);

  // Datos del modal individual
  const [oneFecha, setOneFecha] = useState("");
  const [oneHora, setOneHora] = useState("");
  const [oneDetalle, setOneDetalle] = useState("");

  // Datos del modal por día
  const [dayFecha, setDayFecha] = useState("");
  const [dayInicio, setDayInicio] = useState("");
  const [dayFin, setDayFin] = useState("");
  const [dayDuracion, setDayDuracion] = useState(15);

  // Datos para la conexion del modal por dia
  const [rowIndex, setRowIndex] = useState(null);
  const [respuestaIdSeleccionada, setRespuestaIdSeleccionada] = useState(null);

  const openOne = (idx, rid) => {
    console.log("openOne click idx:", idx, "rid:", rid);
    setRowIndex(idx);
    setRespuestaIdSeleccionada(rid);
    setRowSeleccionada(respuestasPagina[idx]); // para mostrar nombre
    setOneFecha("");
    setOneHora("");
    setOneDetalle("Presentarse 10 min antes");
    setShowModalOne(true);
  };

  const openDay = () => {
    console.log("openDay click"); // ← y esto
    setDayFecha("");
    setDayInicio("");
    setDayFin("");
    setDayDuracion(15);
    setShowModalDay(true);
  };

  const closeAll = () => {
    setShowModalOne(false);
    setShowModalDay(false);
    setRowSeleccionada(null);
  };

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  // Cuando cambia "estado", forzamos página 1 y actualizamos URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (estado) params.set("estado", estado);
    else params.delete("estado");
    params.set("page", "1");
    if (params.toString() !== new URLSearchParams(location.search).toString()) {
      navigate({ search: params.toString() }, { replace: true });
    }
    setPagina(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  // Si el usuario cambia manualmente el page en la URL, sincronízalo
  useEffect(() => {
    const urlPage = parseInt(
      new URLSearchParams(location.search).get("page") || "1",
      10
    );
    if (!isNaN(urlPage) && urlPage !== pagina) setPagina(urlPage);
  }, [location.search]); // eslint-disable-line

  // === Fetch con paginación del servidor ===
  useEffect(() => {
    const fetchRespuestas = async () => {
      try {
        setError("");
        const token = localStorage.getItem("token");
        const API =
          import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
        const base = `${API}/api/formularios/${id}/resumen-respuestas`;

        const params = new URLSearchParams();
        if (estado) params.set("estado", estado);
        params.set("page", String(pagina));
        params.set("page_size", String(porPagina));

        const url = `${base}?${params.toString()}`;

        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        setDatos(res.data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las respuestas");
      }
    };
    fetchRespuestas();
  }, [id, estado, pagina, porPagina]);

  // === Helpers URL ===
  const setEstadoURL = (nuevo) => {
    const params = new URLSearchParams(location.search);
    if (nuevo) params.set("estado", nuevo);
    else params.delete("estado");
    params.set("page", "1");
    navigate({ search: params.toString() }, { replace: true });
  };

  const setPaginaURL = (p) => {
    const params = new URLSearchParams(location.search);
    params.set("page", String(p));
    navigate({ search: params.toString() }, { replace: true });
  };

  if (error) return <p className="text-red-500 text-center mt-5">{error}</p>;
  if (!datos)
    return (
      <p className="text-center mt-5 text-gray-600">Cargando respuestas...</p>
    );

  // totalPaginas: usa "total" si viene del backend; fallback al largo actual
  const totalRegistros = Number.isFinite(datos.total)
    ? datos.total
    : datos.respuestas?.length || 0;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / porPagina));

  // Si el backend ya pagina, "respuestas" ya viene cortada; si no, cortamos aquí:
  const respuestasPagina = Number.isFinite(datos.total)
    ? datos.respuestas || []
    : (datos.respuestas || []).slice(
        (pagina - 1) * porPagina,
        pagina * porPagina
      );

  const respuestaIds =
    datos?.respuesta_ids ??
    datos?.respuestaIds ??
    datos?.ids_respuestas ??
    datos?.ids ??
    [];

  console.log("datos keys:", Object.keys(datos || {}));
  console.log({
    totalIds: respuestaIds.length,
    lenPagina: respuestasPagina.length,
    pagina,
    porPagina,
  });

  // ====== tu render existente, con pequeños cambios ======

  /* const COL_MIN = 200;
  const TABLE_MIN_PX = Math.max((datos.columnas?.length || 1) * COL_MIN, 1000); */
  // Columnas que se pintan (si es 'aprobado' agregamos una columna fija "Acciones")
  const columnas =
    estado === "aprobado"
      ? [...(datos.columnas || []), "Acciones"]
      : datos.columnas || [];

  // Ancho mínimo de tabla basado en 'columnas'
  const COL_MIN = 200;
  const TABLE_MIN_PX = Math.max((columnas.length || 1) * COL_MIN, 1000);

  const headerClamp = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "normal",
  };

  function normalizeFileUrl(raw) {
    if (Array.isArray(raw)) return null;
    const v = raw;
    if (typeof v === "string") {
      const s = v.trim();
      if (/^https?:\/\//i.test(s)) return s;
      if (s.startsWith("/storage/") || s.startsWith("storage/")) {
        const rel = s.startsWith("/") ? s : `/${s}`;
        return `${API_BASE}${rel}`;
      }
      if (s.startsWith("{") && s.endsWith("}")) {
        try {
          const obj = JSON.parse(s);
          if (obj?.url && /^https?:\/\//i.test(obj.url)) return obj.url;
          if (obj?.path) {
            const rel = obj.path.startsWith("/") ? obj.path : `/${obj.path}`;
            return `${API_BASE}${rel}`;
          }
        } catch {}
      }
      return null;
    }
    if (v && typeof v === "object") {
      if (v.url && /^https?:\/\//i.test(v.url)) return v.url;
      if (v.path) {
        const rel = v.path.startsWith("/") ? v.path : `/${v.path}`;
        return `${API_BASE}${rel}`;
      }
    }
    return null;
  }

  const renderCelda = (valor) => {
    if (Array.isArray(valor)) return valor.length ? valor.join(", ") : "—";
    const href = normalizeFileUrl(valor);
    if (href) {
      const nombre = decodeURIComponent(href.split("/").pop() || "Archivo");
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
    <div className="p-6" style={{ overflowX: "hidden" }}>
      {/* TABS */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setEstadoURL(null)}
          className={`px-4 py-2 rounded-lg border ${
            !estado ? "bg-[#2b6cb0] text-white" : "bg-white text-[#2b6cb0]"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setEstadoURL("aprobado")}
          className={`px-4 py-2 rounded-lg border ${
            estado === "aprobado"
              ? "bg-[#2b6cb0] text-white"
              : "bg-white text-[#2b6cb0]"
          }`}
        >
          Aprobados
        </button>
        <button
          onClick={() => setEstadoURL("rechazado")}
          className={`px-4 py-2 rounded-lg border ${
            estado === "rechazado"
              ? "bg-[#2b6cb0] text-white"
              : "bg-white text-[#2b6cb0]"
          }`}
        >
          Rechazados
        </button>
      </div>

      <h2 className="text-2xl font-bold text-purple-700 mb-4">
        Respuestas del Formulario #{id}
      </h2>

      {/* TABLA SCROLLEABLE */}
      <div
        className="border border-purple-200 rounded-2xl shadow-sm"
        style={{
          width: "100%",
          maxWidth: "100%",
          height: "50vh",
          overflowX: "auto",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <table
          className="text-sm"
          style={{
            minWidth: TABLE_MIN_PX + "px",
            width: "max-content",
            borderCollapse: "separate",
            borderSpacing: 0,
            border: "1px solid #e9d5ff",
            tableLayout: "fixed",
          }}
        >
          {/* <thead className="bg-purple-100 text-purple-900 sticky top-0 z-10">
            <tr>
              {datos.columnas.map((col, i) => (
                <th key={i}
                    className="px-4 py-2 text-left font-semibold border-b border-purple-200"
                    style={{ minWidth: COL_MIN, backgroundColor: "#2b6cb0", borderRight: "1px solid #564e5fff", color: "#fff" }}>
                  <div title={col} style={headerClamp}>{col}</div>
                </th>
              ))}
            </tr>
          </thead> */}
          <thead className="bg-purple-100 text-purple-900 sticky top-0 z-10">
            <tr>
              {columnas.map((col, i) => (
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

          {/* <tbody>
            {respuestasPagina.length > 0 ? (
              respuestasPagina.map((fila, i) => (
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
          </tbody> */}
          <tbody>
            {respuestasPagina.length > 0 ? (
              respuestasPagina.map((fila, i) => {
                const rid = resolveRespuestaId(
                  datos,
                  i,
                  pagina,
                  porPagina,
                  respuestasPagina.length
                );

                return (
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

                    {estado === "aprobado" && (
                      <td
                        className="px-4 py-2 border-b border-purple-100 align-top"
                        style={{
                          minWidth: COL_MIN,
                          borderRight: "1px solid #f1e8ff",
                        }}
                      >
                        <button
                          className="px-3 py-1 rounded bg-[#2b6cb0] text-white hover:opacity-90 disabled:opacity-50"
                          onClick={() => openOne(i, rid)}
                          disabled={!rid}
                          title={
                            rid
                              ? `respuesta_id: ${rid}`
                              : "Sin ID en la respuesta actual"
                          }
                        >
                          Agendar entrevista
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columnas.length}
                  className="text-center py-4 text-gray-500 italic"
                >
                  Aún no hay respuestas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setPaginaURL(1)}
            disabled={pagina === 1}
            className={`px-3 py-1 rounded-md ${
              pagina === 1
                ? "bg-gray-200 text-gray-500"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            « Primero
          </button>
          <button
            onClick={() => setPaginaURL(Math.max(1, pagina - 1))}
            disabled={pagina === 1}
            className={`px-3 py-1 rounded-md ${
              pagina === 1
                ? "bg-gray-200 text-gray-500"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            ← Anterior
          </button>

          <span className="text-sm text-gray-700">
            Página {pagina} de {totalPaginas}
          </span>

          <button
            onClick={() => setPaginaURL(Math.min(totalPaginas, pagina + 1))}
            disabled={pagina === totalPaginas}
            className={`px-3 py-1 rounded-md ${
              pagina === totalPaginas
                ? "bg-gray-200 text-gray-500"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            Siguiente →
          </button>
          <button
            onClick={() => setPaginaURL(totalPaginas)}
            disabled={pagina === totalPaginas}
            className={`px-3 py-1 rounded-md ${
              pagina === totalPaginas
                ? "bg-gray-200 text-gray-500"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            Último »
          </button>
        </div>
      )}

      {/* Modal: Agendar entrevista (individual) */}
      <SimpleModal
        isOpen={showModalOne}
        title="Agendar Entrevista"
        onAccept={async () => {
          try {
            const token = localStorage.getItem("token");
            const API =
              import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

            const respuesta_id = respuestaIdSeleccionada;
            console.log({ respuesta_id, rowIndex });

            if (!respuesta_id) {
              alert("No se encontró el ID de la respuesta seleccionada.");
              return;
            }

            const url = `${API}/api/formularios/${id}/entrevistas`;
            const payload = {
              respuesta_id,
              fecha: oneFecha,
              hora: oneHora,
              detalle: oneDetalle || null,
            };
            console.log("POST", url, payload);

            await axios.post(url, payload, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            });

            alert("Entrevista guardada ✅");
            closeAll();
            // opcional: volver a cargar entrevistas o refrescar
            // window.location.reload();
          } catch (err) {
            console.error(err);
            alert("No se pudo guardar la entrevista.");
          }
        }}
        onClose={closeAll}
        acceptDisabled={!oneFecha || !oneHora}
      >
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            {rowSeleccionada ? (
              <span>
                Postulante: <strong>{rowSeleccionada[0] || "—"}</strong>
              </span>
            ) : null}
          </div>

          <label className="block">
            <span className="text-sm">Fecha:</span>
            <input
              type="date"
              className="mt-1 w-full border rounded px-3 py-2"
              value={oneFecha}
              onChange={(e) => setOneFecha(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm">Hora:</span>
            <input
              type="time"
              className="mt-1 w-full border rounded px-3 py-2"
              value={oneHora}
              onChange={(e) => setOneHora(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm">Detalle:</span>
            <input
              type="text"
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="Presentarse 10 min antes"
              value={oneDetalle}
              onChange={(e) => setOneDetalle(e.target.value)}
            />
          </label>
        </div>
      </SimpleModal>

      {/* Modal: Programar entrevista por día */}
      <SimpleModal
        isOpen={showModalDay}
        title="Programar día de entrevistas"
        onAccept={() => {
          console.log("PROGRAMAR POR DÍA", {
            /* ... */
          });
          closeAll();
        }}
        onClose={closeAll}
        acceptText="Generar slots"
        acceptDisabled={
          !dayFecha ||
          !dayInicio ||
          !dayFin ||
          !dayDuracion ||
          dayInicio >= dayFin
        } // ← aquí
      >
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm">Fecha:</span>
            <input
              type="date"
              className="mt-1 w-full border rounded px-3 py-2"
              value={dayFecha}
              onChange={(e) => setDayFecha(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm">Hora inicio:</span>
              <input
                type="time"
                className="mt-1 w-full border rounded px-3 py-2"
                value={dayInicio}
                onChange={(e) => setDayInicio(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm">Hora fin:</span>
              <input
                type="time"
                className="mt-1 w-full border rounded px-3 py-2"
                value={dayFin}
                onChange={(e) => setDayFin(e.target.value)}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm">Duración por entrevista (min):</span>
            <input
              type="number"
              min={5}
              className="mt-1 w-full border rounded px-3 py-2"
              value={dayDuracion}
              onChange={(e) => setDayDuracion(Number(e.target.value || 0))}
            />
          </label>
        </div>
      </SimpleModal>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          style={{ backgroundColor: "#2b6cb0", color: "#fff" }}
        >
          Actualizar
        </button>
      </div>
      {estado === "aprobado" && (
        <div className="flex justify-end mt-4">
          <button
            onClick={openDay}
            className="px-4 py-2 rounded bg-[#2b6cb0] text-white hover:opacity-90"
            title="Programar entrevistas por día"
          >
            Programar entrevista por día
          </button>
        </div>
      )}
    </div>
  );
}
