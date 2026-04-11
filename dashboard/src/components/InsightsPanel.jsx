import { useMemo } from "react";
import {
  mostDetectedKeyword,
  topSuspiciousDomainPattern,
} from "../utils/insights.js";

export default function InsightsPanel({ alerts, criticalSpike }) {
  const kw = useMemo(() => mostDetectedKeyword(alerts), [alerts]);
  const topDom = useMemo(() => topSuspiciousDomainPattern(alerts), [alerts]);

  const lines = useMemo(() => {
    const out = [];
    if (kw) {
      out.push(
        `Most detected keyword: "${kw.word}" (${kw.count} alert${kw.count !== 1 ? "s" : ""}).`
      );
    } else {
      out.push(
        "No tracked keywords in domains or reasons yet (login, verify, secure, …)."
      );
    }
    if (criticalSpike) {
      out.push(
        "High-risk alerts increased: critical count rose since the last refresh."
      );
    } else {
      out.push(
        "Critical volume is flat or down compared to the previous refresh."
      );
    }
    if (topDom) {
      out.push(
        `Top suspicious domain pattern: ${topDom.domain} (${topDom.count} hit${topDom.count !== 1 ? "s" : ""} in medium/critical).`
      );
    } else {
      out.push("No medium or critical domains to rank yet.");
    }
    return out;
  }, [kw, topDom, criticalSpike]);

  return (
    <aside className="insights-panel">
      <h3>Insights</h3>
      <ul>
        {lines.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ul>
    </aside>
  );
}
