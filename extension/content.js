// STEP 1: Get current domain
const domain = window.location.hostname;

// STEP 2: Send to backend
fetch("http://localhost:8000/api/check-domain", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ domain: domain })
})
.then(res => res.json())
.then(data => {
  console.log("Backend response:", data);

  if (data.risk_level === "HIGH") {
    showWarning();
  }
})
.catch(err => console.log("Error:", err));


// STEP 3: Warning overlay function
function showWarning() {
  const overlay = document.createElement("div");

  overlay.innerHTML = `
    <div style="
      position:fixed;
      top:0; left:0;
      width:100%; height:100%;
      background:rgba(0,0,0,0.95);
      color:white;
      z-index:9999;
      display:flex;
      justify-content:center;
      align-items:center;
      flex-direction:column;
      text-align:center;
    ">
      <h1>⚠️ WARNING</h1>
      <p>This site may be trying to steal your credentials</p>
      <p><b>Domain:</b> ${window.location.hostname}</p>

      <button style="
        padding:10px 20px;
        margin:10px;
        background:red;
        color:white;
        border:none;
        cursor:pointer;
      " onclick="window.history.back()">
        Go Back
      </button>

      <button style="
        padding:10px 20px;
        margin:10px;
        background:gray;
        color:white;
        border:none;
        cursor:pointer;
      " onclick="this.parentElement.parentElement.remove()">
        Continue Anyway
      </button>
    </div>
  `;

  document.body.appendChild(overlay);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "PHISHING_ALERT") {
    const banner = document.createElement("div");
    banner.innerText = "⚠️ WARNING: Suspicious Website!";
    banner.style.position = "fixed";
    banner.style.top = "0";
    banner.style.left = "0";
    banner.style.width = "100%";
    banner.style.background = "red";
    banner.style.color = "white";
    banner.style.padding = "10px";
    banner.style.zIndex = "9999";
    banner.style.textAlign = "center";

    document.body.prepend(banner);
  }
});