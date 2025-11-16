import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si el email viene en la URL (por ejemplo ...?email=usuario@gmail.com)
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) setEmail(emailFromUrl);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("El enlace de recuperación no es válido ❌");
      return;
    }

    if (password !== password_confirmation) {
      setMessage("Las contraseñas no coinciden ❌");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/reset-password`,
        {
          token,
          email,
          password,
          password_confirmation,
        }
      );

      setMessage("Contraseña restablecida correctamente ✅");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Error reset:", err.response?.data || err);
      if (err.response?.status === 422) {
        setMessage("Las contraseñas no son válidas ❌");
      } else if (err.response?.status === 400) {
        setMessage("El enlace ya no es válido o ha expirado ❌");
      } else {
        setMessage("Ocurrió un error inesperado 😞");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --azul: #2563eb;
          --azul-oscuro: #1e40af;
          --fondo-claro: #f8fafc;
          --texto: #1e1e2f;
          --color-primary: #2b6cb0;         /* Azul acero */
          --color-primary-light: #90cdf4;   /* Azul claro */
          --color-primary-dark: #1a365d;    /* Azul profundo */
          --color-accent: #38b2ac;          /* Verde azulado sutil */
          --color-dark: #1a202c;
          --color-gray: #718096;
          --color-bg: #edf2f7;
          --color-white: #ffffff;
        }

        .reset-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
          padding: 20px;
        }

        .reset-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 15px 35px rgba(37, 99, 235, 0.25);
          width: 100%;
          max-width: 420px;
          padding: 40px 35px;
          display: flex;
          flex-direction: column;
          text-align: center;
          animation: fadeIn 0.5s ease;
        }

        .reset-container h3 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 24px;
          background: var(--color-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .reset-container form {
          display: flex;
          flex-direction: column;
          gap: 18px;
          text-align: left;
        }

        .reset-container label {
          font-size: 14px;
          font-weight: 600;
          color: var(--texto);
        }

        .reset-container input {
          padding: 14px 16px;
          border-radius: 10px;
          border: 2px solid #eee;
          background: var(--fondo-claro);
          font-size: 15px;
          outline: none;
          transition: all 0.3s ease;
        }

        .reset-container input:focus {
          border-color: var(--azul);
          background: white;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
          font-weight: 600;
          font-size: 16px;
          padding: 14px 0;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(37, 99, 235, 0.5);
        }

        p {
          text-align: center;
          font-weight: 500;
          border-radius: 10px;
          padding: 10px;
          margin-top: 20px;
          animation: fadeIn 0.3s ease;
        }

        p.success {
          color: #0f5132;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        p.error {
          color: #842029;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .reset-container {
            padding: 30px 24px;
          }
          .reset-container h3 {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="reset-page">
        <div className="reset-container">
          <h3>Restablecer Contraseña</h3>
          <form onSubmit={handleSubmit}>
            <label>Correo electrónico:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={!!searchParams.get("email")} // Bloquea si vino por URL
            />

            <label>Nueva contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label>Confirmar contraseña:</label>
            <input
              type="password"
              value={password_confirmation}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>

          {message && (
            <p className={message.includes("✅") ? "success" : "error"}>
              {message}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
