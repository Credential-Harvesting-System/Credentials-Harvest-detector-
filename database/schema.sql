-- Database schema for Credential Harvesting Detection

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP,
    src_ip TEXT,
    dst_ip TEXT,
    domain TEXT,
    http_method TEXT,
    tls_sni TEXT
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP,
    domain TEXT,
    suspicion_score INT,
    reason TEXT
);
