import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Login.css"; // Uses your dark theme styles

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Toggles for visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { resetToken } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    if (password.length < 5) {
      return setError("Password must be at least 5 characters");
    }

    setIsLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/api/auth/resetpassword/${resetToken}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Token invalid or expired");

      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);

    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // --- Success View ---
  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ 
            width: '60px', height: '60px', background: 'rgba(74, 222, 128, 0.2)', 
            borderRadius: '50%', color: '#4ade80', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' 
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 className="auth-title">Password Reset!</h1>
          <p className="auth-sub">Your gravity has been stabilized.</p>
          <p style={{ color: '#6366f1', fontSize: '0.9rem', marginTop: '1rem' }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // --- Form View ---
  return (
    <div className="auth-page">
      <div className="auth-card">
        
        {/* Brand Header */}
        <div className="auth-brand">
          <div className="brand-dot"></div>
          <span className="brand-text">Expense-Nova</span>
        </div>

        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-sub">Create a new secure password.</p>

        {error && (
          <div className="error-toast shake-animation">
            <span className="error-icon">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* New Password */}
          <div className="form-group">
            <label>New Password</label>
            <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="password-input"
                style={{ paddingRight: "45px", width: "100%" }}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide" : "Show"}
                style={{
                  position: 'absolute', right: '12px', background: 'none', border: 'none', 
                  color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center'
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="password-input"
                style={{ paddingRight: "45px", width: "100%" }}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirm(!showConfirm)}
                title={showConfirm ? "Hide" : "Show"}
                style={{
                  position: 'absolute', right: '12px', background: 'none', border: 'none', 
                  color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center'
                }}
              >
                {showConfirm ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}