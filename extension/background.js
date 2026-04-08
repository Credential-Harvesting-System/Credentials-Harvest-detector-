chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    
    const url = new URL(tab.url);

    const data = {
      timestamp: new Date().toISOString(),
      source_ip: "client",
      destination_ip: "server",
      domain: url.hostname,
      method: "GET"
    };
    console.log("Sending domain:", url.hostname);

    fetch("http://127.0.0.1:8000/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
    console.log("Response:", data);

    if (data.alert && data.alert.risk === "CRITICAL") {
        alert("⚠️ WARNING: This site may be a phishing attempt!");
    }
    })
    .catch(err => {
      console.error("Error:", err);
    });
  }

if (data.alert && data.alert.risk === "CRITICAL") {
  chrome.tabs.sendMessage(tabId, {
    type: "PHISHING_ALERT"
  });
}});
