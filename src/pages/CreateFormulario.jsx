import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreateFormulario() {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaCierre, setFechaCierre] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) return alert("Debes iniciar sesión.");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/formularios`,
        //"http://127.0.0.1:8000/api/formularios",
        {
          id_usuario: user.id,
          titulo,
          descripcion,
          fecha_cierre: fechaCierre,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("📦 Respuesta backend:", response.data);

      // ✅ Detecta la estructura devuelta por tu backend
      const nuevoFormulario = response.data.data || response.data;

      if (!nuevoFormulario.id) {
        console.error("⚠️ No se encontró ID en la respuesta:", response.data);
        alert("Error al procesar la respuesta del servidor ❌");
        return;
      }

      alert("Formulario creado ✅");
      navigate(`/dashboard/formulario/${nuevoFormulario.id}/campos`);
    } catch (err) {
      console.error("❌ Error al crear el formulario:", err.response?.data || err);
      alert("Error al crear el formulario ❌");
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <form
        onSubmit={handleSubmit}
        style={{ background: "#fff", padding: 20, borderRadius: 12 }}
      >
        <div style={{ marginBottom: 14 }}>
          <label>Nombre Formulario:</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 10,
              border: "2px solid var(--color-primary)",
              borderRadius: 8,
            }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label>Descripción:</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            required
            style={{
              width: "100%",
              padding: 10,
              border: "2px solid var(--color-primary)",
              borderRadius: 8,
            }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label>Fecha Cierre:</label>
          <input
            type="date"
            value={fechaCierre}
            onChange={(e) => setFechaCierre(e.target.value)}
            required
            style={{
              padding: 10,
              border: "2px solid var(--color-primary)",
              borderRadius: 8,
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            background: "var(--color-primary)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 18px",
            fontWeight: 700,
            cursor: "pointer",
            width: "200px",
            fontSize: "20px"
          }}
        >
          Crear
        </button>
      </form>
    </div>
  );
}
