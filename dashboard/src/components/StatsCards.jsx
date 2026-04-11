import { normalizeRisk } from "../utils/alertHelpers.js";

export default function StatsCards({ alerts }) {
  const total = alerts.length;
  const critical = alerts.filter((a) => normalizeRisk(a) === "CRITICAL").length;
  const medium = alerts.filter((a) => normalizeRisk(a) === "MEDIUM").length;

  return (
    <div className="stats-grid">
      <div className="stat-card stat-card--total">
        <div className="stat-card__label">Total alerts</div>
        <div className="stat-card__value">{total}</div>
      </div>
      <div className="stat-card stat-card--critical">
        <div className="stat-card__label">Critical</div>
        <div className="stat-card__value">{critical}</div>
      </div>
      <div className="stat-card stat-card--medium">
        <div className="stat-card__label">Medium</div>
        <div className="stat-card__value">{medium}</div>
      </div>
    </div>
  );
}
