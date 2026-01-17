import { useMemo, useState } from "react";
// ensure Charts.css is imported in Dashboard or here

export default function MonthlyBar({ orbitData = {} }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]); // Stores keys for custom mode

  // 1. Process ALL data first (Sorted Chronologically)
  const allData = useMemo(() => {
    if (!orbitData || Object.keys(orbitData).length === 0) return [];

    const data = Object.entries(orbitData).map(([key, items]) => {
      const totalExpense = items
        .filter(i => i.type === 'expense')
        .reduce((acc, i) => acc + i.amount, 0);
        
      return {
        originalKey: key, // Keep the full key "December 2025" for filtering
        label: key.split(" ")[0].substring(0, 3), // "Dec"
        fullDate: new Date(key), 
        amount: totalExpense
      };
    });

    return data.sort((a, b) => a.fullDate - b.fullDate);
  }, [orbitData]);

  // 2. Decide what to show (Custom Selection OR Last 4)
  const chartData = useMemo(() => {
    // If Custom Mode is active AND user has selected something
    if (isFilterOpen && selectedKeys.length > 0) {
      // Filter strictly to selected keys, then sort
      return allData
        .filter(d => selectedKeys.includes(d.originalKey))
        .sort((a, b) => a.fullDate - b.fullDate);
    }
    
    // DEFAULT BEHAVIOR: Slice the last 4 items (Most recent)
    // If there are 5 items, indices 0,1,2,3,4 -> slice(-4) takes 1,2,3,4
    return allData.slice(-4);
  }, [allData, isFilterOpen, selectedKeys]);

  // Toggle Logic for Buttons
  const toggleMonth = (key) => {
    setSelectedKeys(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      } else {
        if (prev.length >= 4) return prev; // Hard limit 4 for UI sanity
        return [...prev, key];
      }
    });
  };

  const maxVal = Math.max(...chartData.map(d => d.amount), 100);

  if (allData.length === 0) {
    return <div className="chart-empty">No history recorded yet.</div>;
  }

  return (
    <div className="chart-internal-wrapper" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* FILTER TOGGLE HEADER */}
      <div className="chart-controls" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
         <button 
           className="btn-text-small" 
           onClick={() => {
             setIsFilterOpen(!isFilterOpen);
             // If opening filter for first time, pre-fill with current view
             if (!isFilterOpen && selectedKeys.length === 0) {
               setSelectedKeys(chartData.map(d => d.originalKey));
             }
           }}
           style={{ fontSize: '10px', color: isFilterOpen ? '#6366f1' : '#64748b', cursor: 'pointer', background:'none', border:'none' }}
         >
           {isFilterOpen ? "Done" : "Compare"}
         </button>
      </div>

      {/* FILTER SELECTION UI (Visible only when 'Compare' clicked) */}
      {isFilterOpen && (
        <div className="filter-chips" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {allData.map(d => (
            <button
              key={d.originalKey}
              onClick={() => toggleMonth(d.originalKey)}
              style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid',
                cursor: 'pointer',
                background: selectedKeys.includes(d.originalKey) ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                borderColor: selectedKeys.includes(d.originalKey) ? '#6366f1' : '#334155',
                color: selectedKeys.includes(d.originalKey) ? '#fff' : '#64748b',
                transition: 'all 0.2s'
              }}
            >
              {d.label} {d.fullDate.getFullYear().toString().substr(2)}
            </button>
          ))}
        </div>
      )}

      {/* THE CHART */}
      <div className="bar-chart-container">
        {chartData.map((d, i) => (
          <div key={d.originalKey} className="bar-group">
            <div className="bar-wrapper">
              <div 
                className="bar-fill" 
                style={{ 
                  height: `${(d.amount / maxVal) * 100}%`,
                  animationDelay: `${i * 0.1}s` 
                }}
              >
                <span className="bar-tooltip">₹{d.amount.toLocaleString()}</span>
              </div>
            </div>
            <span className="bar-label">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}