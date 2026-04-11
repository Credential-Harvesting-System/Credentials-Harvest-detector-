const OVERLAY_ID = "cred-harvest-warning-overlay";

function showCriticalWarning(detail) {
  if (document.getElementById(OVERLAY_ID)) return;

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.setAttribute("role", "alertdialog");
  overlay.setAttribute("aria-modal", "true");

  const panel = document.createElement("div");
  panel.style.cssText = [
    "position:fixed",
    "top:0;left:0",
    "width:100%;height:100%",
    "background:rgba(15,23,42,0.97)",
    "color:#f8fafc",
    "z-index:2147483647",
    "display:flex",
    "justify-content:center",
    "align-items:center",
    "flex-direction:column",
    "text-align:center",
    "font-family:system-ui,-apple-system,sans-serif",
    "padding:24px",
    "box-sizing:border-box"
  ].join(";");

  const title = document.createElement("h1");
  title.textContent = "Critical risk warning";
  title.style.cssText = "margin:0 0 12px;font-size:1.5rem;";

  const line1 = document.createElement("p");
  line1.style.margin = "8px 0";
  line1.textContent =
    "This site was flagged as critical. It may try to steal credentials or mislead you.";

  const line2 = document.createElement("p");
  line2.style.margin = "8px 0";
  line2.style.fontSize = "0.95rem";
  line2.style.opacity = "0.9";

  const domain = detail.domain || window.location.hostname;
  const score = detail.score != null ? String(detail.score) : "—";
  const reason = detail.reason || "";
  line2.textContent = `Domain: ${domain} · Score: ${score}${reason ? ` · ${reason}` : ""}`;

  const btnRow = document.createElement("div");
  btnRow.style.cssText = "margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center";

  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.textContent = "Go back";
  backBtn.style.cssText =
    "padding:10px 20px;background:#dc2626;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600";
  backBtn.addEventListener("click", () => window.history.back());

  const dismissBtn = document.createElement("button");
  dismissBtn.type = "button";
  dismissBtn.textContent = "I understand — continue";
  dismissBtn.style.cssText =
    "padding:10px 20px;background:#475569;color:#fff;border:none;border-radius:8px;cursor:pointer";
  dismissBtn.addEventListener("click", () => overlay.remove());

  btnRow.append(backBtn, dismissBtn);
  panel.append(title, line1, line2, btnRow);
  overlay.appendChild(panel);

  if (document.body) {
    document.body.appendChild(overlay);
  } else {
    document.documentElement.appendChild(overlay);
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "CRITICAL_SITE") {
    showCriticalWarning(message);
    sendResponse({ ok: true });
    return true;
  }
  if (message.type === "PHISHING_ALERT") {
    showCriticalWarning({ domain: window.location.hostname, reason: "Suspicious website" });
    sendResponse({ ok: true });
    return true;
  }
});
