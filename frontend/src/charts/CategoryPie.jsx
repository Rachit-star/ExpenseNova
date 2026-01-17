import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function CategoryPie({ items = [] }) {
  
  const data = useMemo(() => {
    const expenses = items.filter(i => i.type === 'expense');
    const categories = {};

    expenses.forEach(item => {
      // Group by Item Name if category is missing, or use 'Uncategorized'
      const cat = item.category || item.name || "Other";
      if (!categories[cat]) categories[cat] = { name: cat, value: 0, color: item.color };
      categories[cat].value += item.amount;
    });

    return Object.values(categories);
  }, [items]);

  if (data.length === 0) {
    return (
        <div style={{
            height: '100%', display:'flex', alignItems:'center', justifyContent:'center', 
            color:'#64748b', fontSize:'13px', fontStyle:'italic'
        }}>
            No expense data
        </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || "#6366f1"} />
          ))}
        </Pie>
        <Tooltip 
            contentStyle={{background: '#0f172a', border: '1px solid #334155', borderRadius:'8px'}}
            itemStyle={{color: '#fff'}}
            formatter={(value) => `₹${value.toLocaleString()}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}