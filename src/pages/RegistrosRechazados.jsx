import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

export default function RegistrosRechazados() {
  const { id } = useParams();
  const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API}/api/formularios/${id}/respuestas/rechazados`,
          { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
        );
        setRows(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        setErr("No se pudieron cargar los rechazados.");
      }
    })();
  }, [id, API]);

  if (err) return <p>{err}</p>;

  const etiquetas = Array.from(
    rows.reduce((set, r) => {
      (r.detalles || []).forEach(d => set.add(d?.campo?.etiqueta || `Campo ${d.campo_id}`));
      return set;
    }, new Set())
  );
  const headers = [...etiquetas, "Estado"];

  return (
    <div>
      <h3>Rechazados — Formulario #{id}</h3>
      <p>
        <Link to={`/dashboard/formulario/${id}/aprobados`}>Ir a Aprobados</Link> |{" "}
        <Link to={`/dashboard/formulario/${id}/respuestas`}>Ir a Todos</Link>
      </p>

      <table>
        <thead>
          <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length}>Sin datos</td></tr>
          ) : rows.map(r => {
            const map = new Map(
              (r.detalles || []).map(d => [d?.campo?.etiqueta || `Campo ${d.campo_id}`, d.valor])
            );
            return (
              <tr key={r.id}>
                {etiquetas.map(et => <td key={et}>{map.get(et) || ""}</td>)}
                <td>{r.estado || ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
