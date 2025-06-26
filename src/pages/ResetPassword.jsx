import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { user, resetPassword } = useApp();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      setMessage("✅ Revisa tu correo para restablecer la contraseña.");
    } catch (error) {
      setMessage("❌ Error al enviar el correo. Intenta de nuevo.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <h2>Restablecer Contraseña</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Enviar enlace</button>
        </form>
        {message && <p className="auth-message">{message}</p>}

        <div className="auth-switch">
          <Link to="/login">Volver a iniciar sesión</Link>
        </div>
      </div>

      <style>{`
        .auth-container {
          max-width: 400px;
          margin: 60px auto;
          padding: 30px;
          border: 1px solid #eee;
          border-radius: 10px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.05);
          text-align: center;
          font-family: 'Poppins', sans-serif;
        }

        .auth-container h2 {
          margin-bottom: 25px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .auth-form input {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 14px;
        }

        .auth-form button {
          padding: 10px;
          background-color: #ffc107;
          color: black;
          font-weight: bold;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .auth-form button:hover {
          background-color: #e0a800;
        }

        .auth-message {
          margin-top: 15px;
          font-size: 14px;
          color: #333;
        }

        .auth-switch {
          margin-top: 20px;
          font-size: 14px;
        }

        .auth-switch a {
          color: #007bff;
          text-decoration: none;
          font-weight: bold;
        }

        .auth-switch a:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
