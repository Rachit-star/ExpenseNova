import { useState, useEffect, useRef } from "react";
import "./AddExpenseModal.css";

const EXPENSE_COLORS = ["#6366f1", "#ec4899", "#f43f5e", "#8b5cf6", "#f59e0b"];
const INCOME_COLORS = ["#10b981", "#06b6d4", "#3b82f6", "#84cc16", "#14b8a6"];

export default function AddExpenseModal({ onClose, onAdd, onEdit, onDelete, expenseToEdit }) {
  const [type, setType] = useState("expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setColor] = useState(EXPENSE_COLORS[0]);
  const [isConfirming, setIsConfirming] = useState(false);
  
  // --- NEW: Recurring State ---
  const [isRecurring, setIsRecurring] = useState(false);

  const nameInputRef = useRef(null);
  const amountInputRef = useRef(null);

  useEffect(() => {
    if (expenseToEdit) {
      setType(expenseToEdit.type || "expense");
      setName(expenseToEdit.name);
      setAmount(expenseToEdit.amount);
      setDescription(expenseToEdit.description || "");
      setColor(expenseToEdit.color);
      // Load recurring state if editing
      setIsRecurring(expenseToEdit.isRecurring || false);
    }
  }, [expenseToEdit]);

  useEffect(() => {
    if (!expenseToEdit) {
      setColor(type === "expense" ? EXPENSE_COLORS[0] : INCOME_COLORS[0]);
    }
  }, [type]);

  useEffect(() => {
    setTimeout(() => {
        if (nameInputRef.current) nameInputRef.current.focus();
    }, 50);
  }, []);

  const handleSubmit = () => {
    if (!name || !amount) return;

    const data = {
      name,
      amount: Number(amount),
      description,
      color: selectedColor,
      type,
      isRecurring, // --- Save this flag ---
    };

    if (expenseToEdit && onEdit) {
      onEdit(expenseToEdit.id, data);
    } else {
      onAdd(data);
    }
    onClose();
  };

  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      amountInputRef.current.focus();
    }
  };

  const handleAmountKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (name && amount) {
        handleSubmit();
      }
    }
  };

  const confirmDelete = () => {
    if (onDelete && expenseToEdit) {
      onDelete(expenseToEdit.id);
      onClose();
    }
  };

  const currentColors = type === "expense" ? EXPENSE_COLORS : INCOME_COLORS;
  const isValid = name.trim().length > 0 && amount.length > 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        
        {isConfirming ? (
          <div className="delete-confirm-view">
             <div className="warning-icon">!</div>
            <h3>Remove Stream?</h3>
            <p>Are you sure you want to remove <strong>{name}</strong>?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsConfirming(false)}>Go Back</button>
              <button className="btn-danger-solid" onClick={confirmDelete}>Yes, Remove</button>
            </div>
          </div>
        ) : (
          <>
            <h3>{expenseToEdit ? "Inspect / Edit Stream" : "New Gravity Stream"}</h3>

            <div className="type-toggle-container">
              <button className={`type-btn ${type === 'expense' ? 'active-expense' : ''}`} onClick={() => setType("expense")}>Expense (Out)</button>
              <button className={`type-btn ${type === 'income' ? 'active-income' : ''}`} onClick={() => setType("income")}>Income (In)</button>
            </div>

            <div className="input-group">
              <label>Stream Name</label>
              <input 
                ref={nameInputRef}
                placeholder={type === 'expense' ? "e.g. Netflix" : "e.g. Salary"} 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                onKeyDown={handleNameKeyDown}
              />
            </div>

            <div className="input-group">
              <label>Monthly Amount</label>
              <input 
                ref={amountInputRef}
                placeholder="0.00" 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                onKeyDown={handleAmountKeyDown}
              />
            </div>

            <div className="input-group">
              <label>Description (Optional)</label>
              <textarea
                className="modal-textarea"
                placeholder="Add notes, context, or details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* --- NEW AUTO-PILOT UI --- */}
            <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                <input 
                  type="checkbox" 
                  id="recurring-check"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#6366f1', cursor: 'pointer' }}
                />
                <label htmlFor="recurring-check" style={{ marginBottom: 0, cursor: 'pointer', color: '#94a3b8', fontSize: '13px' }}>
                  Enable Auto-Pilot (Repeat Monthly)
                </label>
            </div>

            <div className="color-picker-section">
              <label>Stream Color</label>
              <div className="color-palette">
                {currentColors.map((color) => (
                  <button key={color} type="button" className={`color-swatch ${selectedColor === color ? "active" : ""}`} style={{ backgroundColor: color }} onClick={() => setColor(color)} />
                ))}
              </div>
            </div>

            <div className="modal-actions">
              {expenseToEdit ? (
                <button type="button" className="btn-delete-modal" onClick={() => setIsConfirming(true)}>Delete</button>
              ) : <div />}
              
              <div style={{display: 'flex', gap: '10px'}}>
                <button className="btn-cancel" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={handleSubmit} disabled={!isValid}>
                  {expenseToEdit ? "Save" : "Add"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}