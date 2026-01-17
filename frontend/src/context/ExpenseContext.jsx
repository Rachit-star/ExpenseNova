import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext"; 
import API_BASE_URL from "../config"; // 👈 ADD THIS IMPORT!

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [realDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [orbitData, setOrbitData] = useState({});
  const [loading, setLoading] = useState(true);

  // 1. Get the user from AuthContext
  const { user } = useAuth(); 

  // Helper: Get Auth Token directly from storage for API calls
  const getToken = () => localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;

  // 2. Fetch Data when User Changes
  useEffect(() => {
    const fetchUserData = async () => {
      const token = getToken();
      
      // If logged out, clear data and stop
      if (!token) {
        setOrbitData({});
        setLoading(false);
        return;
      }

      try {
        // NOTE: Make sure this URL matches your backend route structure
        // If your route is /api/data, change this. 
        // Based on previous conversations, it might be /api/data OR /api/data/me
        const response = await fetch(`${API_BASE_URL}/api/data`, { 
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Assuming backend returns { orbitData: ... } or just the data directly
          // Adjust based on your exact backend response structure
          // For now, I will assume the structure matches what you had:
          setOrbitData(data.orbitData || {}); 
        } 
      } catch (err) {
        console.error("❌ Network Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // 3. SYNC TO BACKEND (Helper)
  const syncToCloud = async (updatedData) => {
    const token = getToken();
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/api/data/sync`, { // Check this route too
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orbitData: updatedData })
      });
    } catch (err) {
      console.error("❌ Sync Failed:", err);
    }
  };

  const getKey = (date) => date.toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentKey = getKey(viewDate);
  const items = orbitData[currentKey] || [];
  
  const isRealPresent = getKey(viewDate) === getKey(realDate);
  const isFuture = viewDate > realDate && !isRealPresent;

  // --- ACTIONS ---

  const addExpense = (newItem) => {
    const updatedData = { ...orbitData };
    const currentList = updatedData[currentKey] || [];
    
    updatedData[currentKey] = [...currentList, {
      ...newItem,
      id: crypto.randomUUID(), // Or use backend ID if available
      count: 1,
      date: new Date().toISOString(),
      isRecurring: newItem.isRecurring || false
    }];

    setOrbitData(updatedData);
    syncToCloud(updatedData);
  };

  const editExpense = (id, updatedData) => {
    const newData = {
      ...orbitData,
      [currentKey]: orbitData[currentKey].map(i => i.id === id ? { ...i, ...updatedData } : i)
    };
    setOrbitData(newData);
    syncToCloud(newData);
  };

  // 👇 RENAMED THIS to match what we used in Dashboard (deleteItem vs removeExpense)
  // I'm keeping "removeExpense" as the name inside context but exporting it as deleteItem if needed,
  // or you can just use removeExpense in Dashboard. Let's stick to removeExpense for consistency.
  const removeExpense = (id) => {
    const newData = {
      ...orbitData,
      [currentKey]: orbitData[currentKey].filter(i => i.id !== id && i._id !== id) // Handle both ID types
    };
    setOrbitData(newData);
    // Also call backend delete endpoint if you implemented the specific DELETE route
    // await fetch(`http://localhost:5000/api/data/${id}`, { method: 'DELETE', ... }) 
    // For now, syncing the whole object works too if that's how your backend is set up.
    syncToCloud(newData);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + direction);
    const newKey = getKey(newDate);

    // Future Logic (Recurring)
    if (direction === 1) {
      const updatedData = { ...orbitData };
      if (!(updatedData[newKey] && updatedData[newKey].length > 0)) {
        const recurringItems = (updatedData[currentKey] || []).filter(item => item.isRecurring);
        if (recurringItems.length > 0) {
          updatedData[newKey] = recurringItems.map(item => ({
            ...item,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            count: 1
          }));
          setOrbitData(updatedData);
          syncToCloud(updatedData);
        }
      }
    }
    
    // 👇 THE FIX for "Ugly Alert"
    const limitDate = new Date(realDate);
    limitDate.setMonth(limitDate.getMonth() + 1);
    
    if (direction === 1 && newDate > limitDate) {
      return false; // 🚫 Block navigation (Dashboard will show Toast)
    }
    
    setViewDate(newDate);
    return true; // ✅ Allow navigation
  };

  const jumpToPresent = () => setViewDate(realDate);

  // --- STATS ---
  const totalExpense = items.filter(i => i.type === "expense").reduce((acc, i) => acc + i.amount, 0);
  const totalIncome = items.filter(i => i.type === "income").reduce((acc, i) => acc + i.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const topExpense = items.filter(i => i.type === 'expense').sort((a, b) => b.amount - a.amount)[0] || null;

  const averageBurn = useMemo(() => {
    const monthKeys = Object.keys(orbitData);
    if (monthKeys.length === 0) return 0;
    let totalBurn = 0, count = 0;
    monthKeys.forEach(key => {
      const exp = (orbitData[key] || []).filter(i => i.type === 'expense').reduce((s, i) => s + i.amount, 0);
      if (exp > 0) { totalBurn += exp; count++; }
    });
    return count === 0 ? 0 : totalBurn / count;
  }, [orbitData]);

  const calculateMostFrequent = () => {
    const allItems = Object.values(orbitData).flat().filter(i => i.type === 'expense');
    if (allItems.length === 0) return null;
    const counts = {};
    allItems.forEach(item => {
      const name = item.name.trim().toLowerCase();
      counts[name] = (counts[name] || 0) + (item.count || 1);
    });
    let maxName = null, maxCount = 0;
    for (const [name, count] of Object.entries(counts)) {
      if (count > maxCount) { maxCount = count; maxName = name; }
    }
    return maxName ? { name: maxName, count: maxCount } : null;
  };

  return (
    <ExpenseContext.Provider value={{
      items, orbitData, currentOrbitName: currentKey, isRealPresent, isFuture,
      addExpense, editExpense, removeExpense, // <--- Using 'removeExpense'
      deleteItem: removeExpense, // <--- Alias it so 'deleteItem' also works if you used that in Dashboard
      navigateMonth, jumpToPresent,
      totalExpense, totalIncome, netBalance, topExpense, averageBurn,
      mostFrequent: calculateMostFrequent(), loading
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);
export default ExpenseContext;