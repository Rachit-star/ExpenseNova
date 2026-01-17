import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GravitySystemDemo from "../components/GravitySystemDemo";
import "./Home.css";
import API_BASE_URL from "../config"; 


export default function Home() {
  const [userCount, setUserCount] = useState(null);

  // Fetch user count on load
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/count`);
        const data = await res.json();
        setUserCount(data.count);
      } catch (err) {
        console.error("Failed to fetch user count");
      }
    };
    fetchCount();
  }, []);

  return (
    <div className="home-root">
      <div className="bg-grid" />
      <div className="bg-spotlight" />

      {/* Header */}
      <header className="home-header">
        <div className="header-logo">
          <div className="logo-dot" />
          <span>ExpenseNova</span>
        </div>
        
        <nav className="header-nav">
          <Link to="/login" className="nav-link">Log In</Link>
          <Link to="/register" className="nav-btn">Sign Up</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="home-main">
        
        {/* Left Column: about */}
        <section className="hero-copy">
          
          <div className="pilot-badge">
            <span className="pilot-dot"></span>
            <span>
              <strong> Join our {userCount !== null ? userCount : "..."}</strong>  users and keep your finances in track. 
            </span>
          </div>

          <h1>
            Escape the  <br />
            <span className="text-gradient">Spreadsheet</span>
          </h1>

          <p>
            Stop tracking rows and columns. Instantly spot which subscriptions and costs are consuming your budget before they spiral out of control
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn-primary">
              Start Free
            </Link>
          </div>
        </section>

        {/* Right Column: Visualization */}
        <section className="hero-visual">
          <div className="visual-container">
            <GravitySystemDemo />
          </div>
        </section>
      </main>
    </div>
  );
}

//done