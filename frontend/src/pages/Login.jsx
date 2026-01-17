import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // State
  const [isForgotView, setIsForgotView] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); //disables button to prevent double clicking

  const passwordRef = useRef(null); //jumps to password text area after user presses enter

  useEffect(() => { // if user is not null jump to dashboard
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  // Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setIsLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgotpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("✅ Recovery link sent! Check your email.");
      setIsForgotView(false); 
    } catch (err) {
      setError(err.message || "Could not send email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter" && !isForgotView) {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        
        <div className="auth-brand">
          <div className="brand-dot"></div>
          <span className="brand-text">ExpenseNova</span>
        </div>

        <h1 className="auth-title">
          {isForgotView ? "Recover Access" : "Enter your orbit"}
        </h1>
        <p className="auth-sub">
          {isForgotView 
            ? "We'll send a recovery link to your inbox." 
            : "Log in to continue tracking your financial gravity."}
        </p>

        {error && (
          <div className="error-toast shake-animation">
            <span className="error-icon">⚠️</span> {error}
          </div>
        )}
        {message && <div className="success-toast">{message}</div>}

        <form onSubmit={isForgotView ? handleForgot : handleLogin}>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleEmailKeyDown}
              required
              autoFocus
            />
          </div>

          {!isForgotView && (
            <div className="form-group">
              <label>Password</label>
              
              {/* Wrapper for Input + Eye Icon */}
              <div className="input-wrapper">
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="password-input"
                />
                
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>

              {/* Forgot Link Below Input */}
              <div className="forgot-link-wrapper">
                <span 
                  className="forgot-link"
                  onClick={() => { setIsForgotView(true); setError(""); setMessage(""); }}
                >
                  Forgot?
                </span>
              </div>
            </div>
          )}

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? "Processing..." : (isForgotView ? "Send Link" : "Enter Orbit")}
          </button>
        </form>

        <div className="auth-footer">
          {isForgotView ? (
            <span 
              className="back-link"
              onClick={() => { setIsForgotView(false); setError(""); }}
            >
              Back to Login
            </span>
          ) : (
            <>
              Don’t have an account? <Link to="/register">Create one</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}