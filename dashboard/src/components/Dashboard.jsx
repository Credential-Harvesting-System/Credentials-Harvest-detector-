import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../styles/dashboard.css";
import StatsCards from "./StatsCards.jsx";
import Filters from "./Filters.jsx";
import Charts from "./Charts.jsx";
import AlertTable from "./AlertTable.jsx";
import InsightsPanel from "./InsightsPanel.jsx";
import {
  downloadCsv,
  normalizeRisk,
  parseTime,
} from "../utils/alertHelpers.js";

const API_URL = "http://127.0.0.1:8000/api/alerts";
const REFRESH_MS = 2500;

function formatClock(d) {
  if (!d) return "—";
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchDomain, setSearchDomain] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState("timestamp");
  const [sortDir, setSortDir] = useState("desc");
  const [freshIds, setFreshIds] = useState(() => new Set());
  const [criticalSpike, setCriticalSpike] = useState(false);

  const prevIdsRef = useRef(null);
  const prevCriticalRef = useRef(0);
  const hasFetchedRef = useRef(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const ids = new Set(data.map((a) => a.id));
      let newlyAdded = [];
      if (prevIdsRef.current === null) {
        prevIdsRef.current = ids;
      } else {
        newlyAdded = data.filter((a) => !prevIdsRef.current.has(a.id));
        prevIdsRef.current = ids;
      }

      const criticalCount = data.filter(
        (a) => normalizeRisk(a) === "CRITICAL"
      ).length;
      if (!hasFetchedRef.current) {
        setCriticalSpike(false);
        hasFetchedRef.current = true;
      } else {
        setCriticalSpike(criticalCount > prevCriticalRef.current);
      }
      prevCriticalRef.current = criticalCount;

      setAlerts(data);
      setLastUpdated(new Date());

      if (newlyAdded.length) {
        setFreshIds((prev) => {
          const next = new Set(prev);
          for (const a of newlyAdded) next.add(a.id);
          return next;
        });
        for (const a of newlyAdded) {
          const id = a.id;
          window.setTimeout(() => {
            setFreshIds((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          }, 4000);
        }
      }
    } catch (e) {
      console.error("Error fetching alerts:", e);
    }
  }, []);

  useEffect(() => {
    const t0 = window.setTimeout(() => {
      fetchAlerts();
    }, 0);
    const t = window.setInterval(fetchAlerts, REFRESH_MS);
    return () => {
      window.clearTimeout(t0);
      window.clearInterval(t);
    };
  }, [fetchAlerts]);

  const processedAlerts = useMemo(() => {
    let list = [...alerts];
    const q = searchDomain.trim().toLowerCase();
    if (q) {
      list = list.filter((a) =>
        String(a.domain ?? "")
          .toLowerCase()
          .includes(q)
      );
    }
    if (riskFilter !== "ALL") {
      list = list.filter((a) => normalizeRisk(a) === riskFilter);
    }
    list.sort((a, b) => {
      if (sortKey === "score") {
        const sa = Number(a.score) || 0;
        const sb = Number(b.score) || 0;
        return sortDir === "asc" ? sa - sb : sb - sa;
      }
      const ta = parseTime(a.timestamp);
      const tb = parseTime(b.timestamp);
      return sortDir === "asc" ? ta - tb : tb - ta;
    });
    return list;
  }, [alerts, searchDomain, riskFilter, sortKey, sortDir]);

  const handleExport = () => {
    downloadCsv(processedAlerts);
  };

  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Cybersecurity threat dashboard</h1>
          <p className="dashboard-sub">
            Live feed from the credential-harvest detector · auto-refresh every{" "}
            {REFRESH_MS / 1000}s
          </p>
        </div>
        <p className="last-updated">
          Last updated: <strong>{formatClock(lastUpdated)}</strong>
        </p>
      </header>

      <StatsCards alerts={alerts} />

      <Filters
        searchDomain={searchDomain}
        onSearchChange={setSearchDomain}
        riskFilter={riskFilter}
        onRiskChange={setRiskFilter}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortKeyChange={setSortKey}
        onSortDirChange={setSortDir}
        onExportCsv={handleExport}
        exportDisabled={processedAlerts.length === 0}
      />

      <div className="layout-main">
        <div>
          <Charts alerts={processedAlerts} />
          <h3
            className="dashboard-sub"
            style={{
              margin: "1.25rem 0 0.5rem",
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#94a3b8",
            }}
          >
            Alert log
          </h3>
          <AlertTable
            rows={processedAlerts}
            sortKey={sortKey}
            sortDir={sortDir}
            onSortKeyChange={setSortKey}
            onSortDirChange={setSortDir}
            freshIds={freshIds}
          />
        </div>
        <InsightsPanel alerts={alerts} criticalSpike={criticalSpike} />
      </div>
    </div>
  );
}
