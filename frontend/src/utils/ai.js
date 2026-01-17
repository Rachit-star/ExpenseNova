import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
let chatSession = null;

/* -----------------------------
   EXPENSE MEANING HELPER
-------------------------------- */
const explainExpense = (name) => {
  const n = name.toLowerCase();

  if (n.includes("rent")) return "a fixed cost for having a place to live";
  if (n.includes("food") || n.includes("grocery"))
    return "basic daily survival spending";
  if (n.includes("takeout") || n.includes("zomato") || n.includes("swiggy"))
    return "convenience food that adds up quickly";
  if (n.includes("shopping") || n.includes("amazon") || n.includes("flipkart"))
    return "non-essential lifestyle spending";
  if (n.includes("ott") || n.includes("netflix") || n.includes("spotify"))
    return "monthly entertainment subscriptions";
  if (n.includes("travel") || n.includes("uber") || n.includes("ola"))
    return "transport and movement costs";
  if (n.includes("gift") || n.includes("gf") || n.includes("date"))
    return "emotional or relationship spending";

  return "general personal spending";
};

/* -----------------------------
   INITIAL ANALYSIS
-------------------------------- */
export const initializeChat = async (items, netBalance, totalBurn) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
    });

    const estimatedIncome = netBalance + totalBurn;

    const expenseBreakdown = items
      .map(
        (i) =>
          `- ${i.name}: ₹${i.amount} (${explainExpense(i.name)})`
      )
      .join("\n");

    const topExpenses = items
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)
      .map((i) => `${i.name} (₹${i.amount})`)
      .join(", ");

    const prompt = `
You are a friendly but honest Money Coach.
You speak like a real human, not a finance app.

This is ONE person's real monthly situation.

INCOME: ₹${estimatedIncome}
TOTAL SPENT: ₹${totalBurn}
MONEY LEFT: ₹${netBalance}

WHAT THE MONEY WENT INTO:
${expenseBreakdown}

Biggest spends: ${topExpenses}

IMPORTANT RULES:
- Some spending is necessary
- Some spending is emotional or convenience
- Never shame
- Be practical, not preachy

YOUR JOB:
Give a short money checkup in 3 parts.

FORMAT EXACTLY LIKE THIS:

Observation:
(What is happening overall, in simple words)

The Leak:
(Which spending is hurting the most and why it matters in real life)

Action:
(1 or 2 realistic things the user can do THIS WEEK)

STYLE RULES:
- No finance jargon
- No lectures
- No emojis
- No corporate tone
- Sound like a smart friend who actually cares
`;

    chatSession = model.startChat();
    const result = await chatSession.sendMessage(prompt);

    return result.response.text();
  } catch (error) {
    console.error("AI ERROR:", error);

    if (
      error.message?.includes("not found") ||
      error.message?.includes("400")
    ) {
      return initializeChatFallback(items, netBalance, totalBurn);
    }

    if (error.message?.includes("429")) {
      throw new Error("QUOTA_EXCEEDED");
    }

    return "Something went wrong. Try again.";
  }
};

/* -----------------------------
   FALLBACK MODEL
-------------------------------- */
const initializeChatFallback = async (items, netBalance, totalBurn) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    const chat = model.startChat();
    const result = await chat.sendMessage(
      `I spent ₹${totalBurn} and have ₹${netBalance} left. Give me honest advice in simple words.`
    );

    return result.response.text();
  } catch {
    return "System offline. Please try again later.";
  }
};

/* -----------------------------
   CONTINUED CHAT
-------------------------------- */
export const sendMessageToAi = async (userMessage) => {
  if (!chatSession) return "Let me look at your data first.";

  try {
    const result = await chatSession.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    if (error.message?.includes("429")) {
      throw new Error("QUOTA_EXCEEDED");
    }
    return "Connection dropped. Try again.";
  }
};
