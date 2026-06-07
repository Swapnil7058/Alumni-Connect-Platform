POSITIVE_WORDS = {
    "good",
    "great",
    "helpful",
    "thanks",
    "thank",
    "amazing",
    "excellent",
    "support",
    "happy",
    "love",
    "improve",
    "success",
    "guide",
    "guidance",
    "opportunity",
    "well",
}

NEGATIVE_WORDS = {
    "bad",
    "hate",
    "angry",
    "spam",
    "worse",
    "worst",
    "issue",
    "problem",
    "toxic",
    "abuse",
    "fake",
    "fraud",
    "annoying",
    "useless",
    "broken",
}


def analyze_sentiment(text):
    tokens = [
        "".join(ch for ch in word.lower() if ch.isalnum())
        for word in (text or "").split()
    ]
    tokens = [token for token in tokens if token]

    positive_hits = sum(token in POSITIVE_WORDS for token in tokens)
    negative_hits = sum(token in NEGATIVE_WORDS for token in tokens)

    score = 0.5
    if tokens:
        score += (positive_hits - negative_hits) / max(len(tokens), 8)

    score = max(0.0, min(1.0, score))

    if score >= 0.62:
        label = "Positive"
    elif score <= 0.38:
        label = "Negative"
    else:
        label = "Neutral"

    flagged = negative_hits >= 2 or "abuse" in tokens or "fraud" in tokens

    return {
        "score": round(score, 2),
        "label": label,
        "flagged": flagged,
        "positive_hits": positive_hits,
        "negative_hits": negative_hits,
    }
