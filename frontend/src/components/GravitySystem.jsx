import { useState, useMemo } from "react";
import { useExpenses } from "../context/ExpenseContext";
import { Link } from "react-router-dom";
import { formatCompact } from "../utils/formatNumber";
import "./GravitySystem.css";

// Now accepts 'items' as a prop (propItems) to support the merged view
export default function GravitySystem({ isDemo = false, onAddClick, onEditClick, items: propItems }) {
  
  const { items: contextItems } = useExpenses(); 
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  
  // Track hover for Z-Index fix
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // LOGIC FIX: Use the passed 'propItems' (Merged) if available, otherwise fallback to Context (Raw)
  const activeItems = propItems || contextItems;

  const displayItems = isDemo 
    ? [ { id: '1', name: "Rent", amount: 1200, color: "#8b5cf6", type: "expense" } ]
    : activeItems;

  const totalBurn = displayItems.filter(item => item.type === 'expense').reduce((acc, item) => acc + item.amount, 0);
  const totalIncome = displayItems.filter(item => item.type === 'income').reduce((acc, item) => acc + item.amount, 0);
  const netGravity = totalIncome - totalBurn;
  const isPositive = netGravity >= 0;

  const coreColors = isPositive 
    ? { center: "#020617", mid: "#1e1b4b", rim: "#4f46e5", stroke: "#818cf8" } 
    : { center: "#2a0a0a", mid: "#7f1d1d", rim: "#ef4444", stroke: "#fca5a5" };

  const maxAmount = Math.max(...displayItems.map((i) => i.amount), 100);

  const handleFabClick = () => { if (isDemo) setShowSignUpPrompt(true); else if (onAddClick) onAddClick(); };
  const handleNodeClick = (item) => { 
    // If it's a merged node (count > 1), we might not want to open Edit directly 
    // because it represents multiple items. For now, let's allow it but you might
    // want to block it later if it causes confusion.
    if (!isDemo && onEditClick) onEditClick(item); 
  };

  // --- SMART PATH CALCULATION ---
  const getPathData = (index, totalItems) => {
    const width = 800; 
    const height = 600; 
    const centerX = width / 2; 
    const centerY = height / 2 + 50; 
    
    let radiusX = 320; 
    let radiusY = 240;

    // IF CLUTTERED (> 7 items), STAGGER THEM
    if (totalItems > 7) {
       const isOdd = index % 2 !== 0;
       if (isOdd) {
         radiusX = 380; radiusY = 290; 
       } else {
         radiusX = 260; radiusY = 190; 
       }
    }

    const angleStep = Math.PI / (totalItems + 1);
    const angle = (index + 1) * angleStep + Math.PI;

    const sx = centerX + radiusX * Math.cos(angle);
    const sy = centerY + radiusY * Math.sin(angle);
    const ex = centerX; const ey = centerY;
    
    let cx = sx; 
    const cy = sy + (ey - sy) * 0.5;
    if (Math.abs(sx - centerX) < 10) cx = sx + 60; 
    
    return { path: `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`, x: sx, y: sy };
  };

  // --- RENDER NODES ---
  const renderedNodes = useMemo(() => {
    const nodeElements = displayItems.map((item, i) => {
      const { path, x, y } = getPathData(i, displayItems.length);
      const strokeWidth = Math.min(2 + (item.amount / maxAmount) * 4, 8);
      const speed = item.type === 'income' ? 6 : 3; 
      
      // Use the 'count' property we calculated in Dashboard
      const count = item.count || 1; 

      return (
        <g key={item.id} className="stream-group">
          {/* Flow Lines */}
          <path d={path} className="stream-base" />
          <path 
            d={path} 
            className="stream-flow" 
            stroke={`url(#grad-${i})`} 
            strokeWidth={strokeWidth} 
            style={{ animationDuration: `${speed + i * 0.5}s`, filter: "url(#glow-strong)" }} 
          />
          
          <foreignObject 
            x={x - 100} 
            y={y - 100} 
            width="200" 
            height="200" 
            style={{ overflow: 'visible', pointerEvents: 'none' }} 
          >
            <div 
              className="stream-node-wrapper"
              style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div 
                className="stream-node"
                onClick={() => handleNodeClick(item)}
                onMouseEnter={() => setHoveredIndex(i)} 
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ 
                  cursor: isDemo ? 'default' : 'pointer',
                  pointerEvents: 'auto'
                }}
              >
                {/* Floating Badge for merged counts */}
                {count > 1 && <div className="node-count-badge">{count}</div>}
                
                <div className="node-dot" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                <div className="node-card">
                  <span className="node-name">{item.name}</span>
                  <span className="node-amount" style={{ color: item.type === 'income' ? '#10b981' : 'white' }}>
                    {item.type === 'income' ? '+' : ''}₹{formatCompact(item.amount)}
                  </span>
                </div>
              </div>

              {/* Glass Tooltip */}
              <div className="glass-tooltip">
                <div className="tooltip-header" style={{ borderBottom: `1px solid ${item.color}40` }}>
                  <strong>{item.name}</strong>
                </div>
                <div className="tooltip-body">
                  <div className="tooltip-row">
                    <span>Frequency</span>
                    <strong>{count}x</strong>
                  </div>
                  <div className="tooltip-row">
                    <span>Total</span>
                    <strong style={{ color: item.color }}>₹{item.amount.toLocaleString()}</strong>
                  </div>
                  {item.description && (
                     <div className="tooltip-row" style={{marginTop:'4px', fontStyle:'italic', opacity:0.7}}>
                        <span>"{item.description}"</span>
                     </div>
                  )}
                </div>
              </div>
            </div>
          </foreignObject>
        </g>
      );
    });

    if (hoveredIndex !== null && nodeElements[hoveredIndex]) {
      const hoveredElement = nodeElements[hoveredIndex];
      const others = nodeElements.filter((_, idx) => idx !== hoveredIndex);
      return [...others, hoveredElement];
    }

    return nodeElements;

  }, [displayItems, hoveredIndex, maxAmount]);

  return (
    <div className="gravity-wrapper">
      <svg className="gravity-svg" viewBox="0 0 800 600">
        <defs>
          <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {displayItems.map((item, i) => (
            <linearGradient key={i} id={`grad-${i}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100%" y2="0">
              <stop offset="0%" stopColor={item.color} stopOpacity="1" />
              <stop offset="100%" stopColor={item.color} stopOpacity="0.1" />
            </linearGradient>
          ))}
          <radialGradient id="core-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={coreColors.center} />
            <stop offset="60%" stopColor={coreColors.mid} />
            <stop offset="100%" stopColor={coreColors.rim} />
          </radialGradient>
        </defs>

        {renderedNodes}

        <g className="gravity-core" transform="translate(400, 350)">
          <circle r="70" className="core-ring" stroke={coreColors.stroke} />
          <circle r="62" className="core-ring core-ring-white delay-1" />
          <circle r="52" fill="url(#core-grad)" stroke={coreColors.stroke} strokeWidth="3" filter="url(#glow-strong)" />
          
          <text y="-10" className="core-label">NET BURN</text>
          <text y="18" className="core-value" fill={isPositive ? "#fff" : "#fca5a5"}>
            {isPositive ? '+' : ''}₹{formatCompact(netGravity)}
          </text>
        </g>
      </svg>

      <button className="gravity-fab" onClick={handleFabClick}>
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