function isHttpUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url || !isHttpUrl(tab.url)) {
    return;
  }

  const url = new URL(tab.url);
  const payload = {
    timestamp: new Date().toISOString(),
    source_ip: "client",
    destination_ip: "server",
    domain: url.hostname,
    method: "GET"
  };

  fetch("http://127.0.0.1:8000/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.alert && data.alert.risk === "CRITICAL") {
        chrome.tabs
          .sendMessage(tabId, {
            type: "CRITICAL_SITE",
            domain: data.alert.domain,
            score: data.alert.score,
            reason: data.alert.reason || "Suspicious pattern detected"
          })
          .catch(() => {
            /* Restricted pages (e.g. browser store) have no content script */
          });
      }
    })
    .catch((err) => {
      console.error("Credential detector API error:", err);
    });
});
