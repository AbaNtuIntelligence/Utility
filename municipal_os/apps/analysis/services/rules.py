# apps/analysis/services/rules.py

def detect_anomalies(bill):
    issues = []

    if bill.total_amount and bill.total_amount > 5000:
        issues.append("High bill detected")

    if "estimated" in (bill.raw_text or "").lower():
        issues.append("Estimated reading detected")

    return issues