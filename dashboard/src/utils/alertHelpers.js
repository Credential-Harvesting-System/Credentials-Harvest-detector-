/** Normalize risk from API or legacy score-based rules. */
export function normalizeRisk(alert) {
  const r = String(alert.risk ?? "").toUpperCase();
  if (r === "CRITICAL" || r === "MEDIUM" || r === "LOW") return r;
  const s = Number(alert.score) || 0;
  if (s >= 70) return "CRITICAL";
  if (s >= 30) return "MEDIUM";
  return "LOW";
}

export function riskBadgeClass(risk) {
  switch (risk) {
    case "CRITICAL":
      return "risk-badge risk-critical";
    case "MEDIUM":
      return "risk-badge risk-medium";
    default:
      return "risk-badge risk-low";
  }
}

export function rowClassForRisk(risk, isNew) {
  const base = "alert-row";
  const newCls = isNew ? " alert-row--new" : "";
  if (risk === "CRITICAL") return `${base} alert-row--critical${newCls}`;
  if (risk === "MEDIUM") return `${base} alert-row--medium${newCls}`;
  return `${base} alert-row--low${newCls}`;
}

export function parseTime(ts) {
  const t = new Date(ts).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function downloadCsv(rows, filename = "alerts-export.csv") {
  if (!rows.length) return;
  const headers = ["id", "timestamp", "domain", "score", "risk", "reason"];
  const escape = (v) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((a) =>
      headers.map((h) => escape(a[h])).join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
