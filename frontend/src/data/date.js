export function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }) : "";
}

export function fmtDateTime(d) {
  return d ? new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "";
}