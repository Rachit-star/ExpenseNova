import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useExpenses } from "../context/ExpenseContext";
import { formatCompact } from "../utils/formatNumber";
import "./Dashboard.css"; 
import API_BASE_URL from "../config"; // 👈 ADD THIS IMPORT!


export default function Budget() {
  const { items, currentOrbitName } = useExpenses();
  
  // 1. STATE: Start empty, we will load from DB
  const [limits, setLimits] = useState({});
  const [editingCategory, setEditingCategory] = useState(null);
  const [newLimit, setNewLimit] = useState("");
  const [loading, setLoading] = useState(true);

  // 2. TOKEN: Helper to get auth token
  const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.token ? { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' } : {};
  };

  // 3. LOAD: Fetch budgets from MongoDB on mount
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/budgets`, {
          headers: getAuthHeader()
        });
        if (res.ok) {
          const data = await res.json();
          setLimits(data); // The backend returns { category: limit }
        }
      } catch (err) {
        console.error("Failed to load shields", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  // 4. LOGIC: Calculate Shield Health
  const shieldStatus = useMemo(() => {
    const stats = {};
    // Sum up expenses
    items.filter(i => i.type === 'expense').forEach(item => {
      const cat = item.name.trim(); 
      stats[cat] = (stats[cat] || 0) + item.amount;
    });

    // Combine Categories (Active Expenses + Active Limits)
    const allCategories = new Set([...Object.keys(stats), ...Object.keys(limits)]);
    
    return Array.from(allCategories).map(cat => {
      const spent = stats[cat] || 0;
      const limit = limits[cat] || 0;
      let percent = 0;
      if (limit > 0) percent = (spent / limit) * 100;

      // Determine Visual State
      let statusColor = '#64748b'; // Grey
      let statusLabel = 'OFFLINE';
      let cardClass = 'unshielded';
      
      if (limit > 0) {
        cardClass = 'shielded';
        if (spent > limit) {
          statusColor = '#f43f5e'; // Red
          statusLabel = 'BREACHED';
          cardClass = 'breached';
        } else if (percent > 85) {
          statusColor = '#f59e0b'; // Orange
          statusLabel = 'CRITICAL';
        } else {
          statusColor = '#10b981'; // Green
          statusLabel = 'ACTIVE';
        }
      }

      return {
        name: cat,
        spent,
        limit,
        percent,
        statusColor,
        statusLabel,
        cardClass
      };
    }).sort((a, b) => b.spent - a.spent); 
  }, [items, limits]);

  // 5. SAVE: Send updates to Backend
  const handleSave = async (category) => {
    const limitAmount = Number(newLimit);

    if (!newLimit || limitAmount <= 0) {
      // DELETE Request
      try {
        await fetch(`${API_BASE_URL}/api/budgets/${category}`, {
          method: 'DELETE',
          headers: getAuthHeader()
        });
        
        // Update Local State
        const newLimits = { ...limits };
        delete newLimits[category];
        setLimits(newLimits);
      } catch (err) {
        console.error("Failed to delete shield", err);
      }
    } else {
      // POST/UPDATE Request
      try {
        await fetch(`${API_BASE_URL}/api/budgets`, {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({ category, limit: limitAmount })
        });

        // Update Local State
        setLimits(prev => ({ ...prev, [category]: limitAmount }));
      } catch (err) {
        console.error("Failed to set shield", err);
      }
    }
    setEditingCategory(null);
    setNewLimit("");
  };

  if (loading) return <div className="dashboard-container"><p className="loading-container">Initializing Shield Protocols...</p></div>;

  return (
    <div className="dashboard-container dashboard-scrollable">
      <header className="dash-header">
        <div className="header-left">
           <Link to="/dashboard" className="nav-arrow">❮</Link>
           <h1 className="orbit-title">Shield Systems</h1>
        </div>
        <div className="header-right">
           <span className="subtitle subtitle-faded">Orbit: {currentOrbitName}</span>
        </div>
      </header>

      <div className="budget-view">
        <div className="shield-grid">
          {shieldStatus.length === 0 && (
            <div className="empty-placeholder">No active streams detected.</div>
          )}

          {shieldStatus.map((stat) => (
            <div key={stat.name} className={`shield-card ${stat.cardClass}`}>
              
              {/* HEADER: Icon + Name + Status */}
              <div className="card-top">
                 <div className="shield-name-group">
                    {/* Dynamic style for icon background color remains inline as it depends on variable state */}
                    <div className="card-icon" style={{background: stat.statusColor === '#64748b' ? 'rgba(255,255,255,0.05)' : stat.statusColor}}>
                      {stat.name.substring(0,2).toUpperCase()}
                    </div>
                    <span className="shield-title">{stat.name}</span>
                 </div>
                 <div className={`status-pill pill-${stat.statusLabel.toLowerCase()}`}>
                    {stat.statusLabel}
                 </div>
              </div>

              {/* METRIC: The Load Number */}
              <div className="metric-container">
                 <span className="metric-label">Current Load</span>
                 <span className="load-value">
                   ₹{formatCompact(stat.spent)}
                 </span>
              </div>

              {/* CONTROLS AREA */}
              <div className="control-zone">
                {editingCategory === stat.name ? (
                  <div className="input-row">
                    <input 
                      autoFocus
                      type="number" 
                      className="shield-input"
                      placeholder="Limit Amount..."
                      value={newLimit} 
                      onChange={e => setNewLimit(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSave(stat.name)}
                    />
                    <button className="btn-save-mini" onClick={() => handleSave(stat.name)}>SET</button>
                  </div>
                ) : (
                  <>
                    {/* BUTTON STATE */}
                    {stat.limit === 0 ? (
                      <button className="btn-init" onClick={() => { setEditingCategory(stat.name); setNewLimit(stat.spent); }}>
                        + Initialize Shield
                      </button>
                    ) : (
                      /* METER STATE */
                      <div className="meter-box">
                          <div className="meter-text">
                             <span>{Math.round(stat.percent)}% Integrity</span>
                             <span>Max: ₹{formatCompact(stat.limit)}</span>
                          </div>
                          <div className="meter-bg">
                             {/* Dynamic meter width/color must be inline */}
                             <div 
                               className="meter-fill"
                               style={{ 
                                 width: `${Math.min(stat.percent, 100)}%`, 
                                 background: stat.statusColor,
                                 boxShadow: `0 0 10px ${stat.statusColor}`
                               }} 
                             />
                          </div>
                          <button className="btn-calib" onClick={() => { setEditingCategory(stat.name); setNewLimit(stat.limit); }}>
                            Re-calibrate Limit
                          </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}