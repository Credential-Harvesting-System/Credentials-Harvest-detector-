import pandas as pd
import requests

# ------------------------
# 1. Download phishing URLs (OpenPhish free feed)
# ------------------------
url = "https://openphish.com/feed.txt"

print("Downloading phishing URLs...")

response = requests.get(url)
phishing_urls = response.text.split("\n")

phish_df = pd.DataFrame(phishing_urls, columns=["url"])
phish_df["label"] = 1

# ------------------------
# 2. Create legit dataset
# ------------------------
legit_urls = [
    "https://google.com",
    "https://github.com",
    "https://amazon.com",
    "https://microsoft.com",
    "https://openai.com",
    "https://stackoverflow.com",
    "https://linkedin.com",
    "https://youtube.com",
    "https://wikipedia.org",
    "https://apple.com"
] * 100   # replicate to balance

legit_df = pd.DataFrame(legit_urls, columns=["url"])
legit_df["label"] = 0

# ------------------------
# 3. Combine
# ------------------------
df = pd.concat([phish_df, legit_df])

# Remove empty rows
df = df[df["url"].notna()]
df = df[df["url"] != ""]

# Save dataset
df.to_csv("data/dataset.csv", index=False)

print("✅ Dataset created successfully!")
print("Total samples:", len(df))