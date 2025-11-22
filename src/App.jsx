import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import CreateFormulario from "./pages/CreateFormulario";
import Home from "./pages/Home";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import CreateCamposFormulario from "./pages/CreateCamposFormulario";
import VistaPreviaFormulario from "./pages/VistaPreviaFormulario";
import VerFormulario from "./pages/VerFormulario";
import RespuestasFormulario from "./pages/RespuestasFormulario";
import FormularioPublico from "./pages/FormularioPublico";
import Gracias from "./pages/Gracias";
import Perfil from "./pages/Perfil";
import EditarPerfil from "./pages/EditarPerfil";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CondicionesFormulario from "./pages/CondicionesFormulario";
import RegistrosRechazados from "./pages/RegistrosRechazados";
import RegistrosAprobados from "./pages/RegistrosAprobados";
import EntrevistasAgendadas from "./pages/EntrevistasAgendadas";
import EntrevistaConfirmada from "./pages/EntrevistaConfirmada";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/crear-formulario" element={<CreateFormulario />} /> */}
        {/* Privadas: todo cuelga del layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {" "}
              <DashboardLayout />{" "}
            </ProtectedRoute>
          }
        >
          {/* index = /dashboard */}
          <Route index element={<Dashboard />} />

          {/* /dashboard/crear-formulario */}
          <Route path="crear-formulario" element={<CreateFormulario />} />

          <Route
            path="formulario/:id/campos"
            element={<CreateCamposFormulario />}
          />

          <Route path="formulario/:id/ver" element={<VerFormulario />} />
          {/* <Route path="formulario/:id/condiciones" element={<CondicionesFormulario />} /> */}
          <Route
            path="formulario/:id/respuestas"
            element={<RespuestasFormulario />}
          />
          <Route
            path="formulario/:id/respuestas?estado=aprobado"
            element={<RespuestasFormulario />}
          />
          <Route
            path="formulario/:id/respuestas?estado=rechazado"
            element={<RespuestasFormulario />}
          />
          <Route
            path="formulario/:id/entrevistas"
            element={<EntrevistasAgendadas />}
          />
          {/* <Route
            path="formulario/:id/aprobados"
            element={<RegistrosAprobados />}
          />
          <Route
            path="formulario/:id/rechazados"
            element={<RegistrosRechazados />}
          /> */}
          {/* 🔹 Páginas de perfil dentro del dashboard */}
          <Route path="perfil" element={<Perfil />} />
          <Route path="editar-perfil" element={<EditarPerfil />} />
          <Route
            path="formulario/:id/condiciones"
            element={<CondicionesFormulario />}
          />
        </Route>
        {/* 404 opcional */}
        <Route path="*" element={<Home />} />
        <Route
          path="/formularios/:id/preview"
          element={<VistaPreviaFormulario />}
        />
        // App.jsx (añade esta ruta fuera del grupo /dashboard)
        <Route path="/formularios/:id" element={<FormularioPublico />} />
        <Route path="/formularios/:id/gracias" element={<Gracias />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/entrevista-confirmada" element={<EntrevistaConfirmada />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
