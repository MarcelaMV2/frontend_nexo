// EntrevistasAgendadas.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import SimpleModal from "./SimpleModal";
import "./EntrevistasAgendadas.css";

// Recorta textos largos para no romper la tabla
function cut(s, n = 40) {
  if (!s) return "";
  const t = String(s);
  return t.length > n ? t.slice(0, n) + "…" : t;
}

function formatHora(horaRaw) {
  if (!horaRaw) return "";
  const s = String(horaRaw);
  const match = s.match(/(\d{2}:\d{2})/);
  return match ? match[1] : s;
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
        per_page: String(porPagina),
      });
      const url = `${API}/api/formularios/${formularioId}/entrevistas?${params.toString()}`;
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

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
      confirmada: "bg-blue-100 text-blue-800",
      realizada: "bg-green-100 text-green-800",
      cancelada_reclutador: "bg-red-100 text-red-800",
      cancelada_postulante: "bg-red-100 text-red-800",
      solicitud_reprogramacion: "bg-orange-100 text-orange-800",
    };

    const labelMap = {
      pendiente: "Pendiente",
      confirmada: "Confirmada",
      realizada: "Realizada",
      cancelada_reclutador: "Cancelada (RRHH)",
      cancelada_postulante: "Cancelada (Postulante)",
      solicitud_reprogramacion: "Solicita reprogramación",
    };

    const cls = map[estado] || "bg-gray-100 text-gray-700";
    const label = labelMap[estado] || (estado ? estado : "—");

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${cls}`}>
        {label}
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#2b6cb0]">
          Entrevistas agendadas
        </h2>

        {/* BOTÓN PARA IR AL CALENDARIO */}
        <Link
          to={`/dashboard/formulario/${formularioId}/entrevistas/calendario`}
          className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-[#2b6cb0] text-[#2b6cb0] hover:bg-[#2b6cb0] hover:text-white transition"
        >
          Ver calendario
        </Link>
      </div>

      <div className="border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#2b6cb0] text-white">
              <th className="text-left px-6 p-3">Postulante</th>
              <th className="text-left px-6 p-3">Fecha</th>
              <th className="text-left px-6 p-3">Hora</th>
              <th className="text-left px-6 p-3">Estado</th>
              <th className="text-left px-6 p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {items.length ? (
              items.map((it) => {
                const esCancelada =
                  it.estado === "cancelada_reclutador" ||
                  it.estado === "cancelada_postulante";
                const esRealizada = it.estado === "realizada";
                const esConfirmada = it.estado === "confirmada";

                const disableReprogramar =
                  esCancelada || esRealizada || esConfirmada;
                const disableCancelar = esCancelada || esRealizada;
                const disableMarcarRealizada = esCancelada || esRealizada;

                const preview = Array.isArray(it.preview) ? it.preview : [];

                const campoNombre = preview.find((p) =>
                  /nombre/i.test(p?.etiqueta ?? "")
                );
                const campoCorreo = preview.find((p) =>
                  /(correo|email)/i.test(p?.etiqueta ?? "")
                );

                const nombre =
                  it.postulante || campoNombre?.valor || it.nombre || "—";
                const correo = campoCorreo?.valor || "";

                return (
                  <tr key={it.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-6 py-3 align-top">
                      <div className="font-medium">{nombre}</div>
                      {correo && (
                        <div className="text-xs text-gray-600 mt-0.5">
                          Correo: <span>{cut(correo, 40)}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-3">{it.fecha || "—"}</td>
                    <td className="px-6 py-3">{formatHora(it.hora)}</td>
                    <td className="px-6 py-3">{badge(it.estado)}</td>

                    <td className="px-6 py-3 space-x-2">
                      <button
                        className="btn-reprogramar px-3 py-1 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          setTarget(it);
                          setNewFecha(it.fecha || "");
                          setNewHora(it.hora ? it.hora.slice(0, 5) : "");
                          setShowReprog(true);
                        }}
                        disabled={disableReprogramar}
                      >
                        Reprogramar
                      </button>

                      <button
                        className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() =>
                          cambiarEstado(
                            it.id,
                            "cancelada_reclutador",
                            "Cancelado por RRHH"
                          )
                        }
                        disabled={disableCancelar}
                      >
                        Cancelar
                      </button>

                      <button
                        className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() =>
                          cambiarEstado(
                            it.id,
                            "realizada",
                            "Marcado como realizado"
                          )
                        }
                        disabled={disableMarcarRealizada}
                      >
                        Marcar realizada
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No hay entrevistas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > porPagina && (
        <div className="flex itemsQueued-center gap-2 justify-center mt-3">
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

      <SimpleModal
        isOpen={showReprog}
        title="Reprogramar entrevista"
        onAccept={() => {
          if (!target) return;
          reprogramar(target.id, newFecha, newHora);
        }}
        onClose={() => {
          setShowReprog(false);
          setTarget(null);
          setNewFecha("");
          setNewHora("");
        }}
        acceptDisabled={!newFecha || !newHora}
      >
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
      </SimpleModal>
    </div>
  );
}
