import re
from urllib.parse import urlparse

def extract_features(url):
    parsed = urlparse(url)

    return [
        len(url),
        url.count('-'),
        url.count('.'),
        int(bool(re.search(r'\d', url))),
        int(parsed.scheme != "https"),
        int(any(word in url for word in ["login","verify","secure","account"])),
    ]