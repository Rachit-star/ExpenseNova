import "./ExpenseCard.css";

export default function ExpenseCard({ title, amount }) {
  return (
    <div className="expense-card">
      <span>{title}</span>
      <strong>₹{amount}</strong>
    </div>
  );
}
