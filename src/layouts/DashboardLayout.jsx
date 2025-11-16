import React, { useEffect, useState, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  // Título dinámico según ruta
  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith("/dashboard/crear-formulario"))
      return "Crear Formulario";
    return "My workspace";
  }, [location.pathname]);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#fafafa" }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <Topbar user={user} title={pageTitle} />
        <main
          style={{
            flex: 1,
            padding: "30px",
            overflowY: "auto",
            overflowX: "hidden", // 👈 bloquea scroll horizontal global
            minWidth: 0, // 👈 clave en flexbox
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
