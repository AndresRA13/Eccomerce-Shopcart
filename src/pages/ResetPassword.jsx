import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { Button, Loader } from "../components/common";
import Swal from "sweetalert2";

export default function ResetPassword() {
  const { user, resetPassword } = useApp();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      Swal.fire({
        icon: 'success',
        title: 'Correo enviado',
        text: 'Revisa tu correo para restablecer la contraseña.',
        timer: 3000,
        showConfirmButton: false
      });
      setMessage("✅ Revisa tu correo para restablecer la contraseña.");
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al enviar el correo. Intentalo de nuevo.'
      });
      setMessage("❌ Error al enviar el correo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-container">
          {loading ? (
            <div className="loader-container">
              <Loader size="lg" color="#3b82f6" text="Enviando correo..." />
            </div>
          ) : (
            <>
              <h1 className="auth-title">Reset Password</h1>
              <p className="auth-subtitle">Enter your email address and we'll send you a link to reset your password.</p>
              
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="sellostore@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  className="reset-btn-override"
                  disabled={loading}
                >
                  Send Reset Link
                </Button>
              </form>

              {message && (
                <div className={`auth-message ${message.includes('✅') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              <div className="auth-switch">
                <Link to="/login">← Back to Sign In</Link>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 20px;
        }

        .auth-container {
          width: 100%;
          max-width: 400px;
          background: white;
        }

        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
        }

        .auth-title {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          text-align: center;
          margin-bottom: 8px;
          line-height: 1.2;
        }

        .auth-subtitle {
          font-size: 16px;
          color: #6b7280;
          text-align: center;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          text-align: left;
        }

        .input-group input {
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
          background: #f9fafb;
          color: #111827;
          transition: all 0.2s ease;
        }

        .input-group input:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .input-group input::placeholder {
          color: #9ca3af;
        }

        .reset-btn-override {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .reset-btn-override:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .reset-btn-override:active {
          transform: translateY(0);
        }

        .auth-message {
          margin-top: 20px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          text-align: center;
          font-weight: 500;
          margin-bottom: 20px;
        }

        .auth-message.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .auth-message.error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        .auth-switch {
          text-align: center;
          font-size: 14px;
        }

        .auth-switch a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s;
        }

        .auth-switch a:hover {
          color: #2563eb;
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .auth-container {
            padding: 0;
          }
          
          .auth-title {
            font-size: 28px;
          }
        }
      `}</style>
    </>
  );
}
