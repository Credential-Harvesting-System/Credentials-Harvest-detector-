import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from joblib import load

# -----------------------------
# Load test data
# -----------------------------
X_test = pd.read_csv("data/X_test.csv").values.tolist()
y_test = pd.read_csv("data/y_test.csv").values.ravel()

# -----------------------------
# Load model
# -----------------------------
model = load("ml/model.joblib")

# -----------------------------
# ML Predictions
# -----------------------------
y_pred = model.predict(X_test)

# -----------------------------
# Metrics
# -----------------------------
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print("\n📊 ML Evaluation Results:")
print("Accuracy:", accuracy)
print("Precision:", precision)
print("Recall:", recall)
print("F1 Score:", f1)

# -----------------------------
# Confusion Matrix
# -----------------------------
cm = confusion_matrix(y_test, y_pred)

print("\n📊 Confusion Matrix:")
print(cm)

# -----------------------------
# RULE-BASED BASELINE
# -----------------------------
def rule_based(url):
    score = 0
    
    if any(word in str(url) for word in ["login", "verify", "secure", "account", "update"]):
        score += 1
    
    if len(str(url)) > 25:
        score += 1
    
    return 1 if score >= 1 else 0

# ⚠️ IMPORTANT: use same URLs used for X_test
full_df = pd.read_csv("data/dataset.csv")
test_urls = full_df["url"].iloc[:len(y_test)]

rule_preds = [rule_based(url) for url in test_urls]

# Rule metrics
rule_acc = accuracy_score(y_test, rule_preds)
rule_f1 = f1_score(y_test, rule_preds)

print("\n📊 Rule-based Performance:")
print("Accuracy:", rule_acc)
print("F1 Score:", rule_f1)

# -----------------------------
# COMPARISON
# -----------------------------
print("\n📊 Comparison:")
print(f"ML Accuracy: {accuracy:.3f} vs Rule Accuracy: {rule_acc:.3f}")
print(f"ML F1: {f1:.3f} vs Rule F1: {rule_f1:.3f}")