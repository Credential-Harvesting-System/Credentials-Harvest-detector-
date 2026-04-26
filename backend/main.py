from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from joblib import load
from ml.features import extract_features
import json

model = load("ml/model.joblib")

app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

    hasPassword: bool = False
    externalAction: bool = False
    hiddenCount: int = 0
    loginKeywords: bool = False
    noHTTPS: bool = False


# -----------------------------
# STORAGE
# -----------------------------
alerts_data = []


# -----------------------------
# DETECTION LOGIC
# -----------------------------
def detect(event: Event):

    # RULE-BASED (your current logic)
    if event.hasPassword and event.externalAction:
        return 100, "CRITICAL", "Credential harvesting attack detected"

    # ML PREDICTION
    features = extract_features("http://" + event.domain)
    prediction = model.predict([features])[0]

    if prediction == 1:
        return 70, "MEDIUM", "ML detected suspicious URL"

    return 10, "LOW", "Normal traffic"


# -----------------------------
# ROOT
# -----------------------------
@app.get("/")
def home():
    return {"message": "Backend running 🚀"}


# -----------------------------
# RECEIVE EVENT
# -----------------------------
@app.post("/api/events")
def receive_event(event: Event):

    print("📥 Received:", event)

    score, risk, reason = detect(event)

    alert = {
        "id": len(alerts_data) + 1,
        "timestamp": event.timestamp,
        "domain": event.domain,
        "score": score,
        "risk": risk,
        "reason": reason
    }

    alerts_data.append(alert)
    with open("predictions_log.jsonl", "a") as f:
        f.write(json.dumps(alert) + "\n")

    return {"status": "processed", "alert": alert}


# -----------------------------
# SEND ALERTS
# -----------------------------
@app.get("/api/alerts")
def get_alerts():
    print("📤 Sending alerts:", alerts_data)
    return list(reversed(alerts_data))
