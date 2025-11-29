// EntrevistasCalendario.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import SimpleModal from "./SimpleModal"; // 👈 reutilizamos tu modal
import "./EntrevistasCalendario.css";

function cut(s, n = 20) {
  if (!s) return "";
  const t = String(s);
  return t.length > n ? t.slice(0, n) + "…" : t;
}

// Intenta encontrar una hora HH:MM en cualquiera de los campos típicos
function getHoraFromEntrevista(e) {
  if (!e || !e.hora) return "";
  const s = String(e.hora); // puede venir "14:30" o "14:30:00"
  return s.slice(0, 5); // nos quedamos con "14:30"
}

// estados que NO queremos mostrar en el calendario
function isCancelada(estado) {
  return estado === "cancelada_reclutador" || estado === "cancelada_postulante";
}

// clases de color según estado
function estadoClass(estado) {
  switch (estado) {
    case "pendiente":
      return "estado-pendiente";
    case "confirmada":
      return "estado-confirmada";
    case "realizada":
      return "estado-realizada";
    default:
      return "";
  }
}

export default function EntrevistasCalendario() {
  const { id: formularioId } = useParams();
  const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  const [monthDate, setMonthDate] = useState(() => new Date());
  const [diasCal, setDiasCal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // 👇 para el modal de detalle por día
  const [selectedDay, setSelectedDay] = useState(null); // { fechaStr, entrevistas }

  // cargar entrevistas agrupadas por día
  async function fetchCalendario(date = monthDate) {
    try {
      setLoading(true);
      setErr("");
      const token = localStorage.getItem("token");

      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11
      const first = new Date(year, month, 1);
      const last = new Date(year, month + 1, 0);

      const desde = first.toISOString().slice(0, 10);
      const hasta = last.toISOString().slice(0, 10);

      const url = `${API}/api/formularios/${formularioId}/entrevistas-calendario`;

      const { data } = await axios.get(url, {
        params: { desde, hasta },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      // esperamos: { dias: [ { fecha, total, entrevistas: [...] }, ... ] }
      setDiasCal(data.dias || []);
    } catch (e) {
      console.error(e);
      setErr("No se pudo cargar el calendario.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (formularioId) fetchCalendario(monthDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formularioId, monthDate]);

  const handlePrevMonth = () => {
    setMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  // preparar grilla del mes
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastOfMonth.getDate();

  // Lunes = 0 ... Domingo = 6
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;

  const diasMap = new Map(diasCal.map((d) => [d.fecha, d]));

  const cells = [];
  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

  // cabecera
  weekDays.forEach((d) =>
    cells.push({ type: "header", label: d, key: `h-${d}` })
  );

  // espacios antes del día 1
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ type: "empty", key: `e-${i}` });
  }

  // días reales
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const fechaStr = date.toISOString().slice(0, 10);
    const info = diasMap.get(fechaStr);

    cells.push({
      type: "day",
      key: fechaStr,
      date,
      fechaStr,
      total: info ? info.total : 0,
      entrevistas: info ? info.entrevistas : [],
    });
  }

  return (
    <div className="p-6">
      {/* CABECERA + botón volver */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#2b6cb0]">
          Calendario de entrevistas
        </h2>

        <Link
          to={`/dashboard/formulario/${formularioId}/entrevistas`}
          className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-[#2b6cb0] text-[#2b6cb0] hover:bg-[#2b6cb0] hover:text-white transition"
        >
          Volver a la lista
        </Link>
      </div>

      {/* controles de mes */}
      <div className="flex items-center justify-center gap-4 mb-3">
        <button
          className="px-2 py-1 border rounded bg-white hover:bg-gray-50"
          onClick={handlePrevMonth}
        >
          «
        </button>

        <span className="font-semibold text-gray-700">
          {monthDate.toLocaleString("es-ES", {
            month: "long",
            year: "numeric",
          })}
        </span>

        <button
          className="px-2 py-1 border rounded bg-white hover:bg-gray-50"
          onClick={handleNextMonth}
        >
          »
        </button>
      </div>

      {loading && (
        <p className="mt-2 text-center text-gray-500">Cargando entrevistas…</p>
      )}
      {err && <p className="mt-2 text-center text-red-500">{err}</p>}

      {/* grilla del calendario */}
      <div className="nexo-calendar-grid mt-2">
        {cells.map((cell) => {
          // cabecera L M X J V S D
          if (cell.type === "header") {
            return (
              <div key={cell.key} className="nexo-cal-cell nexo-cal-header">
                {cell.label}
              </div>
            );
          }

          // celdas vacías al inicio
          if (cell.type === "empty") {
            return (
              <div key={cell.key} className="nexo-cal-cell nexo-cal-empty" />
            );
          }

          const { date, entrevistas, fechaStr } = cell;

          // 👇 filtramos entrevistas canceladas
          const entrevistasVisibles = (entrevistas || []).filter(
            (e) => !isCancelada(e.estado)
          );
          const total = entrevistasVisibles.length;
          const hasItems = total > 0;

          // preview: primeras 2 entrevistas visibles
          const previewEnt = entrevistasVisibles.slice(0, 2);

          if (!date) {
            return (
              <div key={cell.key} className="nexo-cal-cell nexo-cal-empty" />
            );
          }

          return (
            <div
              key={cell.key}
              className={
                "nexo-cal-cell nexo-cal-day" +
                (hasItems ? " nexo-cal-day-has-items" : "")
              }
              onClick={() =>
                hasItems &&
                setSelectedDay({
                  fechaStr,
                  entrevistas: entrevistasVisibles, // 👈 solo visibles
                })
              }
            >
              <div className="nexo-cal-day-number">{date.getDate()}</div>

              {hasItems && (
                <div className="nexo-cal-badge">
                  {total} entrevista{total > 1 ? "s" : ""}
                </div>
              )}

              {previewEnt.map((e) => {
                const hora = getHoraFromEntrevista(e);
                return (
                  <div
                    key={e.id}
                    className={"nexo-cal-interview " + estadoClass(e.estado)}
                  >
                    {hora && <span>{hora} — </span>}
                    {cut(e.postulante, 18)}
                  </div>
                );
              })}

              {total > 2 && (
                <div className="nexo-cal-more">+{total - 2} más…</div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: detalle de entrevistas de un día */}
      <SimpleModal
        isOpen={!!selectedDay}
        title={selectedDay ? `Entrevistas del ${selectedDay.fechaStr}` : ""}
        onAccept={() => setSelectedDay(null)}
        onClose={() => setSelectedDay(null)}
      >
        {selectedDay &&
          selectedDay.entrevistas
            .slice()
            .sort((a, b) =>
              getHoraFromEntrevista(a).localeCompare(getHoraFromEntrevista(b))
            )
            .map((e) => {
              const hora = getHoraFromEntrevista(e);
              return (
                <div key={e.id} className="border rounded px-3 py-2 bg-gray-50">
                  <div className={"font-medium " + estadoClass(e.estado)}>
                    {hora || "—"} — {e.postulante}
                  </div>
                  {e.estado && (
                    <div className="text-xs text-gray-600">
                      Estado: {e.estado}
                    </div>
                  )}
                </div>
              );
            })}
      </SimpleModal>
    </div>
  );
}
