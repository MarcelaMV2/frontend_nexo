import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function CreateCamposFormulario() {
  const { id } = useParams(); // ID del formulario
  const [campos, setCampos] = useState([]);
  const [etiqueta, setEtiqueta] = useState("");
  const [tipo, setTipo] = useState("texto_corto");
  const [obligatorio, setObligatorio] = useState(false);
  const [archivo, setArchivo] = useState(null);
  // Opciones múltiples (para checkbox, dropdown, ranking, etc.)
  const [opciones, setOpciones] = useState([]);
  const [nuevaOpcion, setNuevaOpcion] = useState("");
  const token = localStorage.getItem("token");

  // Agregar y eliminar opciones
  const agregarOpcion = (e) => {
    e.preventDefault();
    if (!nuevaOpcion.trim()) return;
    setOpciones([...opciones, nuevaOpcion.trim()]);
    setNuevaOpcion("");
  };

  const eliminarOpcion = (index) => {
    setOpciones(opciones.filter((_, i) => i !== index));
  };

  // Obtener los campos existentes
  useEffect(() => {
    const fetchCampos = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/formularios/${id}/campos`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const payload = res.data;

        // Normaliza la respuesta a un array
        const lista = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload.campos)
          ? payload.campos
          : [];

        setCampos(lista);
      } catch (err) {
        console.error("Error al obtener los campos", err);
        setCampos([]); // evita que quede undefined y falle el map
      }
    };

    fetchCampos();
  }, [id, token]);

  // Subir archivo PDF
  const subirArchivo = async (file) => {
    const formData = new FormData();
    formData.append("archivo", file);
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.url; // Devolver la URL pública
    } catch (error) {
      console.error("Error al subir archivo:", error);
      alert("Error al subir el archivo PDF ❌");
      return null;
    }
  };

  // Crear nuevo campo
  const handleAgregarCampo = async (e) => {
    e.preventDefault();
    try {
      let archivoUrl = null;

      if (tipo === "archivo") {
        if (!archivo) {
          alert("Selecciona un archivo PDF antes de continuar.");
          return;
        }
        archivoUrl = await subirArchivo(archivo);
        if (!archivoUrl) return;
      }

      // Si el tipo es "archivo", ya no pedimos subir nada (solo definimos el campo)
      let opcionesFinales = null;

      if (["checkbox", "dropdown", "ranking"].includes(tipo)) {
        if (opciones.length === 0) {
          alert("Agrega al menos una opción para este tipo de campo.");
          return;
        }
        opcionesFinales = opciones;
      }

      const nuevoCampo = {
        id_formulario: id,
        etiqueta,
        tipo,
        obligatorio,
        opciones: opcionesFinales,
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/campos-formulario",
        nuevoCampo,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCampos([...campos, response.data]);
      setEtiqueta("");
      setArchivo(null);
      setOpciones([]);
      alert("Campo agregado ✅");
    } catch (error) {
      console.error("Error al agregar campo:", error);
      alert("Error al crear el campo ❌");
    }
  };

  const handleEliminarCampo = async (idCampo) => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/campos-formulario/${idCampo}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCampos(campos.filter((c) => c.id !== idCampo));
    } catch (err) {
      console.error("Error al eliminar campo", err);
    }
  };

  return (
    <div style={{ display: "flex", gap: "40px", padding: "20px" }}>
      {/* Panel principal */}
      <div style={{ flex: 2 }}>
        <h2 style={{ color: "#9333ea" }}>Campos del Formulario</h2>

        <form onSubmit={handleAgregarCampo}>
          <div style={{ marginBottom: "10px" }}>
            <label>Etiqueta:</label>
            <input
              type="text"
              placeholder="Ej: Fecha de nacimiento"
              value={etiqueta}
              onChange={(e) => setEtiqueta(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "2px solid #c084fc",
                borderRadius: "8px",
              }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Tipo de campo:</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              style={{
                padding: "8px",
                border: "2px solid #c084fc",
                borderRadius: "8px",
                marginLeft: "10px",
              }}
            >
              <option value="texto_corto">Texto corto</option>
              <option value="texto_largo">Texto largo</option>
              <option value="fecha">Fecha</option>
              <option value="checkbox">CheckBox</option>
              <option value="ranking">Ranking</option>
              <option value="dropdown">Dropdown</option>
              <option value="archivo">Archivo (PDF)</option>
              <option value="numero">Número</option>
              <option value="email">Email</option>
              <option value="telefono">Teléfono</option>
              <option value="direccion">Dirección</option>
            </select>
          </div>

          {tipo === "archivo" && (
            <div style={{ marginBottom: "10px" }}>
              <label>Seleccionar archivo (PDF):</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setArchivo(e.target.files[0])}
                style={{ display: "block", marginTop: "5px" }}
              />
              {archivo && <p style={{ fontSize: "14px" }}>📄 {archivo.name}</p>}
            </div>
          )}

          {["checkbox", "dropdown", "ranking"].includes(tipo) && (
            <div style={{ marginBottom: "10px" }}>
              <label>Opciones:</label>
              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <input
                  type="text"
                  placeholder="Escribe una opción..."
                  value={nuevaOpcion}
                  onChange={(e) => setNuevaOpcion(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: "2px solid #c084fc",
                    borderRadius: "8px",
                  }}
                />
                <button
                  onClick={agregarOpcion}
                  style={{
                    background: "#a855f7",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    cursor: "pointer",
                  }}
                >
                  + Agregar
                </button>
              </div>

              <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
                {opciones.map((op, i) => (
                  <li
                    key={i}
                    style={{
                      background: "#f3e8ff",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      marginBottom: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{op}</span>
                    <button
                      onClick={() => eliminarOpcion(i)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#9333ea",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginBottom: "10px" }}>
            <label>Obligatorio:</label>
            <input
              type="checkbox"
              checked={obligatorio}
              onChange={(e) => setObligatorio(e.target.checked)}
              style={{ marginLeft: "10px" }}
            />
          </div>

          <button
            type="submit"
            style={{
              background: "#a855f7",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Agregar campo
          </button>
        </form>
      </div>

      {/* Panel lateral */}
      <div
        style={{
          flex: 1,
          background: "#f3e8ff",
          borderRadius: "12px",
          padding: "15px",
        }}
      >
        <h3 style={{ color: "#6b21a8" }}>Campos agregados</h3>
        {campos.length === 0 ? (
          <p style={{ color: "#a855f7" }}>Aún no hay campos registrados.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {Array.isArray(campos) &&
              campos.map((campo) => (
                <li
                  key={campo.id}
                  style={{
                    background: "#e9d5ff",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    marginBottom: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    {campo.etiqueta} —{" "}
                    <b>{campo.tipo === "archivo" ? "📄 PDF" : campo.tipo}</b>
                  </span>
                  <button
                    onClick={() => handleEliminarCampo(campo.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#7e22ce",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    ✕
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
