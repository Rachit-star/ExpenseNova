import { useState, useEffect, useRef } from "react";
import { initializeChat, sendMessageToAi } from "../utils/ai";
import "./AiAssistant.css";

export default function AiAssistant({ items, netBalance, totalExpense, orbitData, mostFrequent, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [cooldown, setCooldown] = useState(0); 
  const itemsRef = useRef(null);
  const hasRun = useRef(false);

  // --- HELPER: FORMATS TEXT (Bolds & Newlines) ---
  const formatMessage = (text) => {
    if (!text) return "";
    // 1. Convert **text** to <strong>text</strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // 2. Convert newlines to <br>
    formatted = formatted.replace(/\n/g, "<br />");
    return formatted;
  };

  useEffect(() => {
    if (hasRun.current) return; 
    hasRun.current = true;

    const start = async () => {
      try {
        setMessages([{ sender: "ai", text: "Analyzing financial data..." }]);
        const response = await initializeChat(items, netBalance, totalExpense, orbitData);
        setMessages([{ sender: "ai", text: response }]);
      } catch (err) {
        if (err.message === "QUOTA_EXCEEDED") triggerCooldown();
        else setMessages([{ sender: "ai", text: "Connection error." }]);
      } finally {
        setLoading(false);
      }
    };
    start();
  }, [items, netBalance, totalExpense, orbitData]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    itemsRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const triggerCooldown = () => {
    setCooldown(60);
    setMessages(prev => [...prev, { sender: "ai", text: "🔥 System overheating. Cooling down..." }]);
  };

  const handleSend = async () => {
    if (!input.trim() || cooldown > 0) return;
    const userText = input;
    setInput("");
    setMessages(prev => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const response = await sendMessageToAi(userText);
      setMessages(prev => [...prev, { sender: "ai", text: response }]);
    } catch (err) {
      if (err.message === "QUOTA_EXCEEDED") triggerCooldown();
      else setMessages(prev => [...prev, { sender: "ai", text: "Network error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-backdrop" onClick={onClose}>
      <div className="ai-modal chat-mode" onClick={(e) => e.stopPropagation()}>
        
        <div className="ai-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="ai-title-row">
            <span className="ai-avatar">{cooldown > 0 ? "😴" : "🤖"}</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: 'white' }}>Money Coach</h3>
              <span className="ai-status" style={{ color: cooldown > 0 ? '#f43f5e' : '#10b981', fontSize: '11px' }}>
                {cooldown > 0 ? `Offline (${cooldown}s)` : 'Online'}
              </span>
            </div>
          </div>
          <button 
            className="btn-close-icon" 
            onClick={onClose}
            style={{
              position: 'absolute', right: '0px', top: '50%', transform: 'translateY(-50%)',
              background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer', padding: '0 10px'
            }}
          >
            ×
          </button>
        </div>

        {cooldown > 0 && <div className="offline-banner">System Cooling Down...</div>}

        <div className="chat-window">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`chat-bubble ${msg.sender === "user" ? "user-bubble" : "ai-bubble"}`}
              // 👇 THIS IS THE MAGIC: Renders HTML (Bold/Breaks) safely
              dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
            />
          ))}
          {loading && <div className="chat-bubble ai-bubble typing">...</div>}
          <div ref={itemsRef} />
        </div>

        <div className="chat-input-area">
          <input 
            type="text" 
            placeholder={cooldown > 0 ? "Recharging..." : "Ask me anything..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={cooldown > 0 || loading} 
            autoFocus
          />
          <button onClick={handleSend} disabled={cooldown > 0 || loading} style={{ opacity: cooldown > 0 ? 0.5 : 1 }}>
            ➤
          </button>
        </div>

      </div>
    </div>
  );
}