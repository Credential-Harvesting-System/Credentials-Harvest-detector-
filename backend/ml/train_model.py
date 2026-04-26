import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from joblib import dump
from ml.features import extract_features

# Load dataset
df = pd.read_csv("data/dataset.csv")

X = df["url"].apply(extract_features).tolist()
y = df["label"]

# 🔥 SPLIT DATA (IMPORTANT)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Save model
dump(model, "ml/model.joblib")

# Save test data for evaluation
pd.DataFrame(X_test).to_csv("data/X_test.csv", index=False)
pd.Series(y_test).to_csv("data/y_test.csv", index=False)

print("✅ Model trained with train-test split")