export default function Filters({
  searchDomain,
  onSearchChange,
  riskFilter,
  onRiskChange,
  sortKey,
  sortDir,
  onSortKeyChange,
  onSortDirChange,
  onExportCsv,
  exportDisabled,
}) {
  return (
    <div className="filters-bar">
      <div className="filter-field" style={{ flex: "1 1 200px", minWidth: "180px" }}>
        <label htmlFor="search-domain">Search domain</label>
        <input
          id="search-domain"
          type="search"
          placeholder="Filter by domain…"
          value={searchDomain}
          onChange={(e) => onSearchChange(e.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="filter-field">
        <label htmlFor="risk-filter">Risk level</label>
        <select
          id="risk-filter"
          value={riskFilter}
          onChange={(e) => onRiskChange(e.target.value)}
        >
          <option value="ALL">All levels</option>
          <option value="CRITICAL">Critical</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>
      <div className="filter-field">
        <label htmlFor="sort-key">Sort by</label>
        <select
          id="sort-key"
          value={sortKey}
          onChange={(e) => onSortKeyChange(e.target.value)}
        >
          <option value="timestamp">Timestamp</option>
          <option value="score">Score</option>
        </select>
      </div>
      <div className="filter-field">
        <label htmlFor="sort-dir">Order</label>
        <select
          id="sort-dir"
          value={sortDir}
          onChange={(e) => onSortDirChange(e.target.value)}
        >
          <option value="desc">Newest / Highest first</option>
          <option value="asc">Oldest / Lowest first</option>
        </select>
      </div>
      <button
        type="button"
        className="btn-export"
        onClick={onExportCsv}
        disabled={exportDisabled}
      >
        Export CSV
      </button>
    </div>
  );
}
