import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
// Recorta textos largos para no romper la tabla
function cut(s, n = 40) {
  if (!s) return "";
  const t = String(s);
  return t.length > n ? t.slice(0, n) + "…" : t;
}

export default function EntrevistasAgendadas() {
  const { id: formularioId } = useParams(); // <- tomar id de la URL
  const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [pagina, setPagina] = useState(1);
  const [porPagina] = useState(10);
  const [total, setTotal] = useState(0);

  const [showReprog, setShowReprog] = useState(false);
  const [target, setTarget] = useState(null);
  const [newFecha, setNewFecha] = useState("");
  const [newHora, setNewHora] = useState("");

  async function fetchData(p = pagina) {
    try {
      setLoading(true);
      setErr("");
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: String(p),
        per_page: String(porPagina), // <- usa per_page
      });
      const url = `${API}/api/formularios/${formularioId}/entrevistas?${params.toString()}`;
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      // Shape devuelto por tu controlador:
      // { data: [...], pagination: { total, current_page, per_page, last_page } }
      const arr = Array.isArray(data) ? data : data.data || [];
      setItems(arr);
      const totalSrv = data.pagination?.total ?? arr.length ?? 0;
      setTotal(totalSrv);
      setPagina(data.pagination?.current_page ?? p);
    } catch (e) {
      console.error(e);
      setErr("No se pudieron cargar las entrevistas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (formularioId) fetchData(1);
  }, [formularioId]);

  const badge = (estado) => {
    const map = {
      pendiente: "bg-yellow-100 text-yellow-800",
      realizada: "bg-green-100 text-green-800",
      cancelada: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${
          map[estado] || "bg-gray-100 text-gray-700"
        }`}
      >
        {estado ? estado[0].toUpperCase() + estado.slice(1) : "—"}
      </span>
    );
  };

  async function cambiarEstado(id, estado, detalle = null) {
    try {
      const token = localStorage.getItem("token");
      const url = `${API}/api/entrevistas/${id}/estado`;
      await axios.patch(
        url,
        { estado, detalle },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      await fetchData();
    } catch (e) {
      console.error(e);
      alert("No se pudo actualizar el estado.");
    }
  }

  async function reprogramar(id, fecha, hora) {
    try {
      const token = localStorage.getItem("token");
      // Reprogramar = mismo endpoint de estado, con nueva fecha/hora
      const url = `${API}/api/entrevistas/${id}/estado`;
      await axios.patch(
        url,
        { estado: "pendiente", fecha, hora, detalle: "Reprogramado por RRHH" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setShowReprog(false);
      setTarget(null);
      setNewFecha("");
      setNewHora("");
      await fetchData();
    } catch (e) {
      console.error(e);
      alert("No se pudo reprogramar.");
    }
  }

  if (loading)
    return (
      <p className="mt-4 text-center text-gray-500">Cargando entrevistas…</p>
    );
  if (err) return <p className="mt-4 text-center text-red-500">{err}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#2b6cb0] mb-4">
        Entrevistas agendadas
      </h2>

      <div className="border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#2b6cb0] text-white">
              <th className="text-left p-3">Postulante / Datos (5)</th>
              <th className="text-left p-3">Fecha/Hora</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {items.length ? (
              items.map((it) => (
                <tr key={it.id} className="odd:bg-white even:bg-gray-50">
                  <td className="p-3 align-top">
                    {/* Línea principal: nombre si existe (sino “—”) */}
                    <div className="font-medium">
                      {it.postulante || it.nombre || "—"}
                    </div>

                    {/* Preview: hasta 5 primeros campos del formulario */}
                    {Array.isArray(it.preview) && it.preview.length > 0 && (
                      <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                        {it.preview
                          .filter(
                            (p) => (p?.valor ?? "").toString().trim() !== ""
                          )
                          .slice(0,1)
                          .map((p, k) => (
                            <div
                              key={k}
                              className="text-xs text-gray-600"
                              title={`${p.etiqueta}: ${p.valor}`}
                            >
                              <span className="font-semibold">
                                {p.etiqueta}:
                              </span>{" "}
                              <span>{cut(p.valor, 40)}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </td>

                  <td className="p-3">
                    {it.fecha || "—"} {it.hora ? it.hora.slice(0, 5) : ""}
                  </td>
                  <td className="p-3">{badge(it.estado)}</td>
                  <td className="p-3 space-x-2">
                    <button
                      className="px-3 py-1 rounded bg-[#2b6cb0] text-white hover:opacity-90"
                      onClick={() => {
                        setTarget(it);
                        setShowReprog(true);
                      }}
                      disabled={it.estado === "cancelada"}
                    >
                      Reprogramar
                    </button>
                    <button
                      className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
                      onClick={() =>
                        cambiarEstado(it.id, "cancelada", "Cancelado por RRHH")
                      }
                      disabled={it.estado === "cancelada"}
                    >
                      Cancelar
                    </button>
                    <button
                      className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
                      onClick={() =>
                        cambiarEstado(
                          it.id,
                          "realizada",
                          "Marcado como realizado"
                        )
                      }
                      disabled={it.estado !== "pendiente"}
                    >
                      Marcar realizada
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No hay entrevistas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > porPagina && (
        <div className="flex items-center gap-2 justify-center mt-3">
          <button
            className="px-3 py-1 rounded border"
            disabled={pagina === 1}
            onClick={() => fetchData(1)}
          >
            «
          </button>
          <button
            className="px-3 py-1 rounded border"
            disabled={pagina === 1}
            onClick={() => fetchData(pagina - 1)}
          >
            ‹
          </button>
          <span className="text-sm">Página {pagina}</span>
          <button
            className="px-3 py-1 rounded border"
            disabled={pagina * porPagina >= total}
            onClick={() => fetchData(pagina + 1)}
          >
            ›
          </button>
        </div>
      )}

      {showReprog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border p-5 w-[460px]">
            <h3 className="font-bold text-lg mb-3">Reprogramar entrevista</h3>
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm">Fecha</span>
                <input
                  type="date"
                  className="border rounded px-3 py-2 w-full"
                  value={newFecha}
                  onChange={(e) => setNewFecha(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-sm">Hora</span>
                <input
                  type="time"
                  className="border rounded px-3 py-2 w-full"
                  value={newHora}
                  onChange={(e) => setNewHora(e.target.value)}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-3 py-1 rounded border"
                onClick={() => {
                  setShowReprog(false);
                  setTarget(null);
                  setNewFecha("");
                  setNewHora("");
                }}
              >
                Cancelar
              </button>
              <button
                className="px-3 py-1 rounded bg-[#2b6cb0] text-white"
                disabled={!newFecha || !newHora}
                onClick={() => reprogramar(target.id, newFecha, newHora)}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
