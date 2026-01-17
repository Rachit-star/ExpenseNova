import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

// Contexts & Hooks
import { useExpenses } from "../context/ExpenseContext";
import { useAuth } from "../context/AuthContext"; 
import { useSound } from "../hooks/useSound"; 

// Components
import GravitySystem from "../components/GravitySystem";
import AddExpenseModal from "../components/AddExpenseModal";
import AiAssistant from "../components/AiAssistant";
import { formatCompact } from "../utils/formatNumber";

// Charts
import CategoryPie from "../charts/CategoryPie";
import MonthlyBar from "../charts/MonthlyBar";

export default function Dashboard() {
  const { 
    items, orbitData,
    totalExpense, totalIncome, netBalance,
    topExpense, averageBurn, mostFrequent,
    addExpense, editExpense, removeExpense, 
    currentOrbitName, isRealPresent, isFuture, 
    navigateMonth, jumpToPresent 
  } = useExpenses(); 
  
  const { logout } = useAuth();
  const { playSound } = useSound(); 

  // --- LOCAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // AI Modal State
  const [isAiOpen, setIsAiOpen] = useState(false);

  // --- 1. FILTER FOR LIST (Raw Data) ---
  const filteredListItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [items, searchTerm]);

  // --- 2. AGGREGATE FOR VISUALIZER (Merged Data) ---
  const visualizerItems = useMemo(() => {
    const map = new Map();
    const source = searchTerm ? filteredListItems : items;

    source.forEach(item => {
      const key = `${item.name.toLowerCase()}-${item.type}`;
      
      if (map.has(key)) {
        const existing = map.get(key);
        existing.amount += item.amount; 
        existing.count = (existing.count || 1) + 1; 
      } else {
        map.set(key, { ...item, count: 1 });
      }
    });
    return Array.from(map.values());
  }, [items, filteredListItems, searchTerm]);

  // Helpers
  const formatDate = (isoString) => {
    if (!isoString) return "Legacy";
    return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };
  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : "??";
  const canEdit = isRealPresent || isFuture;

  // Handlers
  const handleNav = (dir) => { playSound("hover"); navigateMonth(dir); };
  const handleJumpToPresent = () => { playSound("hover"); jumpToPresent(); };
  const handleOpenAdd = () => { if (canEdit) { playSound("click"); setExpenseToEdit(null); setIsModalOpen(true); } };
  const handleOpenEdit = (item) => { if (canEdit) { playSound("click"); setExpenseToEdit(item); setIsModalOpen(true); } };
  const handleLogoutClick = () => { playSound("click"); setIsLogoutConfirmOpen(true); };
  const confirmLogout = () => { playSound("success"); logout(); setIsLogoutConfirmOpen(false); };

  return (
    <div className="dashboard-container">
      
      <header className="dash-header">
        <div className="header-left">
          <div className="orbit-nav">
             <button className="nav-arrow" onClick={() => handleNav(-1)}>❮</button>
             <div className="nav-title-wrapper">
               <h1 className="orbit-title">{currentOrbitName}</h1>
               {!isRealPresent && (
                 <span className="history-tag" onClick={handleJumpToPresent}>
                   {isFuture ? "Future Mode" : "History Mode"} • Return to Present
                 </span>
               )}
             </div>
             <button className="nav-arrow" onClick={() => handleNav(1)}>❯</button>
          </div>
          <div className="header-subtitle-row">
            <p className="subtitle">
              Net Burn: 
              <span style={{color: netBalance >= 0 ? '#10b981' : '#f43f5e', fontWeight: '600', marginLeft: '6px'}}>
                {netBalance >= 0 ? '+' : ''}₹{formatCompact(netBalance)}
              </span>
            </p>
          </div>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center' }}>
          
          {/* KPI Group */}
          <div className="kpi-group">
             <div className="kpi-card">
                <span>Avg. Monthly Burn</span>
                <strong>₹{formatCompact(averageBurn)}</strong>
             </div>
             <div className="total-badge">
               <div style={{ display: 'flex', gap: '16px' }}>
                 <div style={{ textAlign: 'right' }}>
                   <span style={{color: '#10b981', fontSize: '10px', fontWeight: '700'}}>IN</span>
                   <strong style={{display:'block', fontSize:'18px'}}>₹{formatCompact(totalIncome)}</strong>
                 </div>
                 <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                 <div style={{ textAlign: 'right' }}>
                   <span style={{color: '#f43f5e', fontSize: '10px', fontWeight: '700'}}>OUT</span>
                   <strong style={{display:'block', fontSize:'18px'}}>₹{formatCompact(totalExpense)}</strong>
                 </div>
               </div>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="header-actions-group">
             
             {/* 1. Shield Button */}
             <Link to="/budget" className="btn-shield" title="Configure Shields" onClick={() => playSound("click")}>
                <div className="shield-icon">🛡</div>
                <span className="shield-text">Shields</span>
             </Link>

             {/* 2. AI Insight Button */}
            {/* 2. AI Insight Button (Now using a Vector SVG for perfect center) */}
            {/* 2. AI Insight Button (Sliding Pill with SVG) */}
             <button className="nav-btn btn-ai" onClick={() => setIsAiOpen(true)} title="Ask Money Coach">
                {/* The Vector Icon (Perfectly Centered) */}
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="ai-icon-svg" // Added class for animation
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                
                {/* The Text (Hidden until hover) */}
                <span className="btn-label-slide">Insight</span>
             </button>

             {/* 3. Logout Button */}
             <button className="btn-logout" onClick={handleLogoutClick} title="Sign Out">⏻</button>
          </div>
        </div>
      </header>

      {/* --- MAIN GRID --- */}
      <div className="dash-grid-top">
        
        {/* VISUALIZER */}
        <div className={`grid-item visual-card ${!canEdit ? 'read-only-mode' : ''}`}>
          <div className="card-header">
            <h3>Visualizer</h3>
            <div className="header-actions">
              {canEdit && <button className="btn-icon primary" onClick={handleOpenAdd}>+ Add</button>}
            </div>
          </div>
          <div className="gravity-container-small">
            {items.length === 0 ? (
               <div className="empty-placeholder">
                 <p>Orbit Empty</p>
                 {canEdit && <button className="btn-text" onClick={handleOpenAdd}>Initialize Stream</button>}
               </div>
            ) : (
              <GravitySystem 
                items={visualizerItems} 
                isDemo={false} 
                onAddClick={canEdit ? handleOpenAdd : null} 
                onEditClick={handleOpenEdit} 
              />
            )}
          </div>
        </div>

        {/* LIST */}
        <div className={`grid-item list-card ${!canEdit ? 'read-only-list' : ''}`}>
          <div className="list-header-row">
            <h3>{!isRealPresent ? (isFuture ? "Future Streams" : "Archived Streams") : "Active Streams"}</h3>
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Scan frequencies..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="expense-list">
            {filteredListItems.length === 0 && <p style={{color:'#64748b', textAlign:'center', marginTop:'20px'}}>No streams found.</p>}
            {filteredListItems.map((item) => (
              <div key={item.id} className="expense-row" onClick={() => handleOpenEdit(item)} 
                   style={{ borderLeft: `3px solid ${item.type === 'income' ? '#10b981' : '#f43f5e'}`, cursor: canEdit ? 'pointer' : 'default' }}>
                <div className="row-left">
                  <div className="row-icon" style={{ backgroundColor: item.color }}>{getInitials(item.name)}</div>
                  <div className="row-info">
                    <span className="row-name">
                      {item.name}
                      {item.isRecurring && (
                        <span style={{ marginLeft: '6px', fontSize: '12px', color: '#6366f1' }} title="Auto-Pilot Active">↻</span>
                      )}
                    </span>
                    <span className="row-date" style={{ opacity: 0.6 }}>{formatDate(item.date)}</span>
                  </div>
                </div>
                <div className="row-right">
                  <span className="row-amount" style={{ color: item.type === 'income' ? '#10b981' : 'white' }}>
                    {item.type === 'income' ? '+' : '-'}₹{formatCompact(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-grid-bottom">
        <div className="grid-item chart-card">
           <h3>Spend Distribution</h3>
           <div className="chart-wrapper"><CategoryPie items={items} /></div>
        </div>
        <div className="grid-item chart-card">
           <h3>Orbit History</h3>
           <div className="chart-wrapper">
             <MonthlyBar orbitData={orbitData} />
           </div>
        </div>
        <div className="stats-column">
           <div className="grid-item stat-card black-hole-card">
             <h3>Heaviest Stream</h3>
             {topExpense ? (
               <div className="stat-content">
                  <div className="stat-icon red-pulse">⚠</div>
                  <div className="stat-info">
                    <strong className="stat-amount">₹{formatCompact(topExpense.amount)}</strong>
                    <span className="stat-name">{topExpense.name}</span>
                  </div>
               </div>
             ) : (
               <div className="empty-placeholder"><p>No data</p></div>
             )}
           </div>
           <div className="grid-item stat-card frequency-card">
             <h3>Most Frequent</h3>
             {mostFrequent ? (
               <div className="stat-content">
                  <div className="stat-icon blue-pulse">★</div>
                  <div className="stat-info">
                    <strong className="stat-amount">{mostFrequent.count}x</strong>
                    <span className="stat-name" style={{textTransform:'capitalize'}}>{mostFrequent.name}</span>
                  </div>
               </div>
             ) : (
               <div className="empty-placeholder"><p>No data</p></div>
             )}
           </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Add/Edit Expense Modal */}
      {isModalOpen && <AddExpenseModal onClose={() => setIsModalOpen(false)} onAdd={addExpense} onEdit={editExpense} onDelete={removeExpense} expenseToEdit={expenseToEdit} />}
      
      {/* 2. AI Assistant Modal */}
      {isAiOpen && (
        <AiAssistant 
          items={items} 
          netBalance={netBalance} 
          totalExpense={totalExpense}
          orbitData={orbitData}         // Passing History
          mostFrequent={mostFrequent}   // Passing Freq Stats
          onClose={() => setIsAiOpen(false)} 
        />
      )}

      {/* 3. Logout Confirmation */}
      {isLogoutConfirmOpen && (
        <div className="orbit-modal-backdrop" onClick={() => setIsLogoutConfirmOpen(false)}>
          <div className="orbit-modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{color: '#fca5a5'}}>Eject from Dashboard?</h3>
            <p>You will be returned to the login orbit.</p>
            <div className="orbit-actions">
              <button className="btn-secondary" onClick={() => setIsLogoutConfirmOpen(false)}>Cancel</button>
              <button className="btn-confirm" onClick={confirmLogout} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.5)' }}>Confirm Eject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}