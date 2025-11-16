import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Pencil, X } from "lucide-react";

export default function CondicionesFormulario() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const [condiciones, setCondiciones] = useState([]);
  const [campos, setCampos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevaCondicion, setNuevaCondicion] = useState({
    id_campo: "",
    operador: "",
    valor: "",
  });

  const [campoSeleccionado, setCampoSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCampos = await axios.get(
          `${API_BASE}/api/formularios/${id}/campos`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const resCond = await axios.get(
          `${API_BASE}/api/formularios/${id}/condiciones`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const camposApi = Array.isArray(resCampos.data)
          ? resCampos.data
          : resCampos.data.campos || [];

        // ✅ Tipos válidos según el formato real de tu backend
        const tiposValidos = [
          "fecha",
          "checkbox",
          "radio",
          "select",
          "numero",
          "telefono",
        ];

        // Obtener los id de campos que ya tienen una condición creada
        const camposConCondicion = resCond.data.map((cond) => cond.id_campo);

        // Filtrar campos válidos y sin condición previa
        const camposFiltrados = camposApi.filter(
          (campo) =>
            tiposValidos.includes(campo.tipo?.toLowerCase()) &&
            !camposConCondicion.includes(campo.id)
        );

        console.log("Campos devueltos por la API:", camposApi);
        console.log("Campos válidos filtrados:", camposFiltrados);

        setCampos(camposFiltrados);
        setCondiciones(resCond.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchData();
  }, [id, token]);

  const actualizarCamposFiltrados = (resCampos, resCond) => {
    const tiposValidos = [
      "fecha",
      "checkbox",
      "radio",
      "select",
      "numero",
      "telefono",
    ];
    const camposApi = Array.isArray(resCampos.data)
      ? resCampos.data
      : resCampos.data.campos || [];
    const camposConCondicion = resCond.data.map((cond) => cond.id_campo);

    const camposFiltrados = camposApi.filter(
      (campo) =>
        tiposValidos.includes(campo.tipo?.toLowerCase()) &&
        !camposConCondicion.includes(campo.id)
    );
    setCampos(camposFiltrados);
  };

  const guardarCondicion = async () => {
    if (
      !nuevaCondicion.id_campo ||
      !nuevaCondicion.operador ||
      !nuevaCondicion.valor
    )
      return alert("Completa todos los campos antes de guardar.");

    // Si el valor es array (checkbox), conviértelo a string
    const valorFinal = Array.isArray(nuevaCondicion.valor)
      ? nuevaCondicion.valor.join(",")
      : nuevaCondicion.valor;

    await axios.post(
      `${API_BASE}/api/condiciones`,
      { ...nuevaCondicion, id_formulario: id, valor: valorFinal },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 🔹 Refrescamos ambos conjuntos de datos
    const [resCampos, resCond] = await Promise.all([
      axios.get(`${API_BASE}/api/formularios/${id}/campos`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_BASE}/api/formularios/${id}/condiciones`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    setCondiciones(resCond.data);
    actualizarCamposFiltrados(resCampos, resCond);
    setMostrarModal(false);
    setCampoSeleccionado(null);
    setNuevaCondicion({ id_campo: "", operador: "", valor: "" });
  };

  const iniciarEdicion = (condicion) => {
    setModoEdicion(true);
    setMostrarModal(true);
    setNuevaCondicion({
      id: condicion.id,
      id_campo: condicion.id_campo,
      operador: condicion.operador,
      valor: condicion.valor,
    });
    setCampoSeleccionado(condicion.campo);
  };

  const actualizarCondicion = async () => {
    if (
      !nuevaCondicion.id_campo ||
      !nuevaCondicion.operador ||
      !nuevaCondicion.valor
    )
      return alert("Completa todos los campos antes de guardar.");

    const valorFinal = Array.isArray(nuevaCondicion.valor)
      ? nuevaCondicion.valor.join(",")
      : nuevaCondicion.valor;

    await axios.put(
      `${API_BASE}/api/condiciones/${nuevaCondicion.id}`,
      { ...nuevaCondicion, valor: valorFinal },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const [resCampos, resCond] = await Promise.all([
      axios.get(`${API_BASE}/api/formularios/${id}/campos`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_BASE}/api/formularios/${id}/condiciones`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    setCondiciones(resCond.data);
    actualizarCamposFiltrados(resCampos, resCond);
    setMostrarModal(false);
    setModoEdicion(false);
    setCampoSeleccionado(null);
  };

  const eliminarCondicion = async (idCond) => {
    if (!confirm("¿Eliminar esta condición?")) return;
    await axios.delete(`${API_BASE}/api/condiciones/${idCond}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Refrescar condiciones + campos disponibles
    const [resCampos, resCond] = await Promise.all([
      axios.get(`${API_BASE}/api/formularios/${id}/campos`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_BASE}/api/formularios/${id}/condiciones`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    setCondiciones(resCond.data);
    actualizarCamposFiltrados(resCampos, resCond);
  };

  const getOperadoresPorTipo = (tipo) => {
    switch (tipo) {
      case "checkbox":
        return ["=", "contiene"];
      case "radio":
      case "select":
        return ["="];
      case "numero":
      case "fecha":
        return ["=", "!=", ">", "<", ">=", "<="];
      case "telefono":
        return ["=", "!="];
      default:
        return ["="];
    }
  };

  const getDescripcionPorTipo = (tipo) => {
    switch (tipo) {
      case "checkbox":
        return "Este campo puede tener varios valores. Puedes verificar si contiene uno o varios.";
      case "radio":
      case "select":
        return "Selecciona el valor que debe cumplirse en este campo.";
      case "numero":
        return "Compara valores numéricos (ejemplo: >= 18).";
      case "fecha":
        return "Compara fechas (ejemplo: > 2024-01-01).";
      case "telefono":
        return "Compara números de teléfono exactos.";
      default:
        return "Selecciona un operador y un valor de comparación.";
    }
  };

  // Renderiza el campo de valor dinámicamente
  const renderCampoValor = (campo, condicion, setCondicion) => {
    if (campo.tipo === "checkbox") {
      try {
        const opciones = JSON.parse(campo.opciones || "[]");
        return (
          <div style={{ marginBottom: 20 }}>
            {opciones.map((op, idx) => (
              <label
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "6px",
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    Array.isArray(condicion.valor)
                      ? condicion.valor.includes(op)
                      : false
                  }
                  onChange={(e) => {
                    let nuevosValores = Array.isArray(condicion.valor)
                      ? [...condicion.valor]
                      : [];
                    if (e.target.checked) nuevosValores.push(op);
                    else nuevosValores = nuevosValores.filter((v) => v !== op);
                    setCondicion({ ...condicion, valor: nuevosValores });
                  }}
                />
                {op}
              </label>
            ))}
          </div>
        );
      } catch {
        return null;
      }
    }

    // Fecha o número con tipo de input correspondiente
    const tipoInput =
      campo.tipo === "numero"
        ? "number"
        : campo.tipo === "fecha"
        ? "date"
        : "text";

    return (
      <input
        type={tipoInput}
        placeholder="Ej: 25, 2025-01-01..."
        value={condicion.valor}
        onChange={(e) => setCondicion({ ...condicion, valor: e.target.value })}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid var(--color-gray-light)",
          marginBottom: 20,
        }}
      />
    );
  };

  return (
    <div
      style={{
        padding: "32px",
        background: "var(--color-bg)",
        minHeight: "100vh",
      }}
    >
      <h2
        style={{
          color: "var(--color-primary-dark)",
          fontSize: "22px",
          fontWeight: "700",
          marginBottom: "16px",
        }}
      >
        Condiciones de Formulario
      </h2>
      <hr
        style={{ borderColor: "var(--color-gray-light)", marginBottom: "24px" }}
      />

      {/* Lista de condiciones */}
      {/* Tabla de condiciones */}
      {condiciones.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
            background: "var(--color-white)",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
          }}
        >
          <thead style={{ background: "#e6ecff" }}>
            <tr>
              <th style={{ textAlign: "left", padding: "10px 16px" }}>Campo</th>
              <th style={{ textAlign: "center", padding: "10px 16px" }}>
                Operador
              </th>
              <th style={{ textAlign: "center", padding: "10px 16px" }}>
                Valor
              </th>
              <th style={{ textAlign: "center", padding: "10px 16px" }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {condiciones.map((c) => (
              <tr
                key={c.id}
                style={{
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onClick={() => iniciarEdicion(c)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f7faff")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "white")
                }
              >
                <td style={{ padding: "10px 16px" }}>
                  <strong>{c.campo?.etiqueta || "Campo"}</strong>
                </td>
                <td style={{ textAlign: "center", padding: "10px 16px" }}>
                  {c.operador}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "10px 16px",
                    color: "var(--color-primary)",
                    fontWeight: 600,
                  }}
                >
                  {c.valor}
                </td>
                <td style={{ textAlign: "center", padding: "10px 16px" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      iniciarEdicion(c);
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#2b6cb0",
                      fontSize: "18px",
                      cursor: "pointer",
                      marginRight: "10px",
                    }}
                    title="Editar"
                  >
                    <Pencil size={18} strokeWidth={2.2} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarCondicion(c.id);
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#1e3a8a",
                      fontWeight: "bold",
                      fontSize: "18px",
                      cursor: "pointer",
                      transition: "color 0.2s",
                    }}
                    onMouseOver={(e) => (e.target.style.color = "#2563eb")}
                    onMouseOut={(e) => (e.target.style.color = "#1e3a8a")}
                    title="Eliminar"
                  >
                    <X size={20} strokeWidth={2.4} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: "var(--color-gray)" }}>
          Aún no hay condiciones registradas.
        </p>
      )}

      <button
        onClick={() => {
          setMostrarModal(true);
          setModoEdicion(false);
          setNuevaCondicion({ id_campo: "", operador: "", valor: "" });
        }}
        style={{
          marginTop: "24px",
          background: "var(--color-primary)",
          color: "var(--color-white)",
          border: "none",
          borderRadius: "10px",
          padding: "10px 20px",
          cursor: "pointer",
          fontWeight: "600",
          boxShadow: "0 4px 10px rgba(43,108,176,0.25)",
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) =>
          (e.target.style.background = "var(--color-primary-dark)")
        }
        onMouseOut={(e) => (e.target.style.background = "var(--color-primary)")}
      >
        + Agregar condición
      </button>

      {/* MODAL */}
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
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "var(--color-white)",
              borderRadius: "12px",
              padding: "32px",
              width: "480px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
              position: "relative",
            }}
          >
            <h3
              style={{
                color: "var(--color-primary-dark)",
                fontWeight: "700",
                marginBottom: "16px",
              }}
            >
              {modoEdicion ? "Editar condición" : "Nueva condición"}
            </h3>

            {/* Campo */}
            <label
              style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
            >
              Campo:
            </label>

            {modoEdicion ? (
              <div
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-gray-light)",
                  background: "#f7f7f7",
                  marginBottom: 12,
                  fontWeight: 600,
                  color: "#2b6cb0",
                }}
              >
                {campoSeleccionado?.etiqueta || "Campo seleccionado"}
              </div>
            ) : (
              <select
                value={nuevaCondicion.id_campo}
                onChange={(e) => {
                  const idCampoSel = parseInt(e.target.value);
                  const campoSel = campos.find((c) => c.id === idCampoSel);
                  setNuevaCondicion({
                    ...nuevaCondicion,
                    id_campo: idCampoSel,
                    operador: "",
                    valor: "",
                  });
                  setCampoSeleccionado(campoSel || null);
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-gray-light)",
                  marginBottom: 12,
                }}
              >
                <option value="">Seleccionar campo</option>
                {campos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.etiqueta}
                  </option>
                ))}
              </select>
            )}

            {/* Operador y valor */}
            {campoSeleccionado && (
              <>
                <label
                  style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
                >
                  Operador:
                </label>
                <select
                  value={nuevaCondicion.operador}
                  onChange={(e) =>
                    setNuevaCondicion({
                      ...nuevaCondicion,
                      operador: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-gray-light)",
                    marginBottom: 8,
                  }}
                >
                  <option value="">Seleccionar operador</option>
                  {getOperadoresPorTipo(campoSeleccionado.tipo).map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>

                <p
                  style={{
                    color: "var(--color-gray)",
                    fontSize: "13px",
                    marginBottom: "12px",
                  }}
                >
                  {getDescripcionPorTipo(campoSeleccionado.tipo)}
                </p>

                <label
                  style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
                >
                  Valor:
                </label>
                {renderCampoValor(
                  campoSeleccionado,
                  nuevaCondicion,
                  setNuevaCondicion
                )}
              </>
            )}

            {/* Botones */}
            <div style={{ textAlign: "right", marginTop: 16 }}>
              <button
                onClick={() => setMostrarModal(false)}
                style={{
                  background: "var(--color-gray-light)",
                  border: "none",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginRight: "8px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>

              <button
                onClick={modoEdicion ? actualizarCondicion : guardarCondicion}
                style={{
                  background: "var(--color-primary)",
                  color: "var(--color-white)",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                {modoEdicion ? "Actualizar" : "Aceptar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
