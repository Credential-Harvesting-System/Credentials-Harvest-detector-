from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import numpy as np

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# DATA MODEL
# -----------------------------
class Event(BaseModel):
    timestamp: str
    source_ip: str
    destination_ip: str
    domain: str
    method: str

# -----------------------------
# IN-MEMORY STORAGE (NO DB)
# -----------------------------
alerts_data = []

# -----------------------------
# SIMPLE FEATURE EXTRACTOR
# -----------------------------
def extract_features(domain: str):
    return [
        len(domain),
        domain.count('-'),
        domain.count('.'),
        int(any(word in domain for word in ["login", "verify", "secure", "account", "update"]))
    ]

# -----------------------------
# SIMPLE DETECTION LOGIC
# -----------------------------
def detect_phishing(domain: str):
    score = 0

    # suspicious keywords
    if any(word in domain for word in ["login", "verify", "secure", "account", "update"]):
        score += 40

    # too many hyphens
    if domain.count('-') > 2:
        score += 20

    # long domain
    if len(domain) > 25:
        score += 20

    # fake words
    if "fake" in domain or "phish" in domain:
        score += 30

    # final risk
    # Treat only very strong signals as CRITICAL
    if score >= 70:
        risk = "CRITICAL"
    elif score >= 30:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return score, risk

# -----------------------------
# ROOT CHECK
# -----------------------------
@app.get("/")
def home():
    return {"message": "Backend running 🚀"}

# -----------------------------
# RECEIVE EVENT FROM EXTENSION
# -----------------------------
@app.post("/api/events")
def receive_event(event: Event):
    print("📥 Received:", event.domain)

    try:
        score, risk = detect_phishing(event.domain)

        alert = {
            "id": len(alerts_data) + 1,
            "timestamp": event.timestamp,
            "domain": event.domain,
            "score": score,
            "risk": risk,
            "reason": "Suspicious pattern detected" if risk != "LOW" else "Normal traffic"
        }

        alerts_data.append(alert)

        return {
            "status": "processed",
            "alert": alert
        }

    except Exception as e:
        print("❌ Error:", e)
        return {
            "status": "error",
            "message": str(e)
        }

# -----------------------------
# GET ALERTS FOR DASHBOARD
# -----------------------------
@app.get("/api/alerts")
def get_alerts():
    print("📤 Sending alerts:", alerts_data)  # DEBUG
    return list(reversed(alerts_data))