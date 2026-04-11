import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { normalizeRisk } from "../utils/alertHelpers.js";

const TOOLTIP_STYLE = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 8,
  color: "#e2e8f0",
};

function buildTimeline(alerts) {
  const buckets = new Map();
  for (const a of alerts) {
    const d = new Date(a.timestamp);
    const key = Number.isFinite(d.getTime())
      ? d.toISOString().slice(0, 10)
      : "Unknown";
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  return [...buckets.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildRiskPie(alerts) {
  const counts = { CRITICAL: 0, MEDIUM: 0, LOW: 0 };
  for (const a of alerts) {
    const r = normalizeRisk(a);
    counts[r] = (counts[r] || 0) + 1;
  }
  return [
    { name: "Critical", value: counts.CRITICAL, fill: "#ef4444" },
    { name: "Medium", value: counts.MEDIUM, fill: "#eab308" },
    { name: "Low", value: counts.LOW, fill: "#22c55e" },
  ].filter((x) => x.value > 0);
}

function buildTopDomains(alerts) {
  const byDomain = new Map();
  for (const a of alerts) {
    const dom = String(a.domain || "").trim() || "(unknown)";
    const s = Number(a.score) || 0;
    const prev = byDomain.get(dom) ?? 0;
    if (s > prev) byDomain.set(dom, s);
  }
  return [...byDomain.entries()]
    .map(([domain, score]) => ({
      domain: domain.length > 20 ? `${domain.slice(0, 18)}…` : domain,
      fullDomain: domain,
      score,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

export default function Charts({ alerts }) {
  const lineData = useMemo(() => buildTimeline(alerts), [alerts]);
  const pieData = useMemo(() => buildRiskPie(alerts), [alerts]);
  const barData = useMemo(() => buildTopDomains(alerts), [alerts]);

  const empty = alerts.length === 0;

  return (
    <section className="charts-section" aria-label="Alert visualizations">
      <div className="chart-card">
        <h3>Alerts over time</h3>
        {empty || lineData.length === 0 ? (
          <p className="empty-state">No timeline data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="count"
                name="Alerts"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 3, fill: "#38bdf8" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="charts-row charts-row--split">
        <div className="chart-card">
          <h3>Risk distribution</h3>
          {empty || pieData.length === 0 ? (
            <p className="empty-state">No risk breakdown yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={80}
                  paddingAngle={2}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="rgba(15,23,42,0.8)" />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h3>Top risky domains (by score)</h3>
          {empty || barData.length === 0 ? (
            <p className="empty-state">No domain scores yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="domain"
                  stroke="#94a3b8"
                  tick={{ fontSize: 10 }}
                  width={100}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value) => [value, "Max score"]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullDomain ?? ""
                  }
                />
                <Bar dataKey="score" name="Score" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}
