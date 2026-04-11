import {
  normalizeRisk,
  riskBadgeClass,
  rowClassForRisk,
} from "../utils/alertHelpers.js";

export default function AlertTable({
  rows,
  sortKey,
  sortDir,
  onSortKeyChange,
  onSortDirChange,
  freshIds,
}) {
  const toggleSort = (key) => {
    if (sortKey === key) {
      onSortDirChange(sortDir === "asc" ? "desc" : "asc");
    } else {
      onSortKeyChange(key);
      onSortDirChange(key === "timestamp" ? "desc" : "desc");
    }
  };

  const sortIndicator = (key) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  if (!rows.length) {
    return (
      <div className="table-wrap">
        <p className="empty-state">No alerts match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="alert-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>
              <button type="button" onClick={() => toggleSort("timestamp")}>
                Timestamp{sortIndicator("timestamp")}
              </button>
            </th>
            <th>Domain</th>
            <th>
              <button type="button" onClick={() => toggleSort("score")}>
                Score{sortIndicator("score")}
              </button>
            </th>
            <th>Risk</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((alert) => {
            const risk = normalizeRisk(alert);
            const isNew = freshIds.has(alert.id);
            return (
              <tr
                key={alert.id}
                className={rowClassForRisk(risk, isNew)}
              >
                <td>{alert.id}</td>
                <td>{alert.timestamp ?? "—"}</td>
                <td className="domain-cell">{alert.domain ?? "—"}</td>
                <td>{alert.score ?? "—"}</td>
                <td>
                  <span className={riskBadgeClass(risk)}>{risk}</span>
                </td>
                <td className="reason-cell">{alert.reason ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
