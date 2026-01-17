import { useState } from "react";
import { Link } from "react-router-dom";
import "./GravitySystem.css";

export default function GravitySystemDemo() {
  // Demo Data for Home Page
  const items = [
    { name: "Rent", amount: 1200, color: "#8b5cf6" },
    { name: "AWS", amount: 450, color: "#ec4899" },
    { name: "Staff", amount: 2800, color: "#10b981" },
    { name: "Tools", amount: 150, color: "#f59e0b" },
  ];
  
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);

  const total = items.reduce((acc, item) => acc + item.amount, 0);
  const maxAmount = Math.max(...items.map((i) => i.amount));

  //  Clicking "+" triggers the prompt
  const handleAddClick = () => {
    setShowSignUpPrompt(true);
  };

  // --- SVG MATH as we need curves,animation etc ---
  const getPathData = (index, totalItems) => {
    const width = 800;
    const height = 600; 
    const centerX = width / 2;
    const centerY = height / 2 + 50;
    const radiusX = 320; //different radius for elliptical look
    const radiusY = 240;
    const angleStep = Math.PI / (totalItems + 1); //all streams come from up so half a circle
    const angle = (index + 1) * angleStep + Math.PI;
    const sx = centerX + radiusX * Math.cos(angle); //cos angle-> horizontal offset
    const sy = centerY + radiusY * Math.sin(angle); //sin angle->vertical offset ,noe each node sits on an ellipse in our hitbox
    const ex = centerX;
    const ey = centerY;
    let cx = sx; //using beizers curve
    const cy = sy + (ey - sy) * 0.5;
    if (Math.abs(sx - centerX) < 10) cx = sx + 60;
    return { path: `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`, x: sx, y: sy };
  };

  return (
    <div className="gravity-wrapper">
      <svg className="gravity-svg" viewBox="0 0 800 600">
        <defs>
          <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {items.map((item, i) => (
            <linearGradient key={i} id={`grad-${i}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100%" y2="0">
              <stop offset="0%" stopColor={item.color} stopOpacity="1" />
              <stop offset="100%" stopColor={item.color} stopOpacity="0.1" />
            </linearGradient>
          ))}
          <radialGradient id="core-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="60%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#4f46e5" />
          </radialGradient>
        </defs>

        {items.map((item, i) => {
          const { path, x, y } = getPathData(i, items.length);
          const strokeWidth = 2 + (item.amount / maxAmount) * 4; //bigger expense thicker line
          return (
            <g key={i} className="stream-group">
              <path d={path} className="stream-base" />
              <path d={path} className="stream-flow" stroke={`url(#grad-${i})`} strokeWidth={strokeWidth} style={{ animationDuration: `${3 + i * 0.5}s`, filter: "url(#glow-strong)" }} />
              <foreignObject x={x - 75} y={y - 25} width="150" height="60">
                <div className="stream-node">
                  <div className="node-dot" style={{ background: item.color, boxShadow: `0 0 10px ${item.color}` }} />
                  <div className="node-card">
                    <span className="node-name">{item.name}</span>
                    <span className="node-amount">₹{item.amount.toLocaleString()}</span>
                  </div>
                </div>
              </foreignObject>
            </g>
          );
        })}

        <g className="gravity-core" transform="translate(400, 350)">
          <circle r="70" className="core-ring" />
          <circle r="62" className="core-ring core-ring-white delay-1" />
          <circle r="52" fill="url(#core-grad)" stroke="#818cf8" strokeWidth="3" filter="url(#glow-strong)" />
          <text y="-10" className="core-label">TOTAL SPENT</text>
          <text y="18" className="core-value">₹{total.toLocaleString()}</text>
        </g>
      </svg>

      
      <button className="gravity-fab" onClick={handleAddClick}>
        <span className="plus">+</span> Add Stream
      </button>

     
      {showSignUpPrompt && (
        <div className="limit-toast">
          <div className="toast-content">
            <strong>Start Tracking</strong>
            <p>Create a free account to add your own expenses.</p>
          </div>
          <Link to="/register" className="toast-btn">Sign Up</Link>
          <button className="toast-close" onClick={() => setShowSignUpPrompt(false)}>✕</button>
        </div>
      )}
    </div>
  );
}

 //I used SVG geometry to place expense nodes on an ellipse and connected them to a central sink using Bézier curves.
// Thickness and animation speed are scaled by amount to imply weight and pull.
// It’s not physics-based gravity, but visually communicates financial drain.

//done