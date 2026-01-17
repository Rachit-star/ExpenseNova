export const formatCompact = (num) => {
  if (!num) return "0";
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  // Trillions
  if (absNum >= 1.0e+12) return sign + (absNum / 1.0e+12).toFixed(1) + "T";
  // Billions
  if (absNum >= 1.0e+9) return sign + (absNum / 1.0e+9).toFixed(1) + "B";
  // Millions
  if (absNum >= 1.0e+6) return sign + (absNum / 1.0e+6).toFixed(1) + "M";
  // Thousands (only if > 10k to keep small amounts precise)
  if (absNum >= 10000) return sign + (absNum / 1.0e+3).toFixed(1) + "K";
  
  // Default: Return with commas
  return num.toLocaleString();
};