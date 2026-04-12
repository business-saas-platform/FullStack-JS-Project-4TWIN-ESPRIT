from datetime import datetime

import pandas as pd


def parse_date(value) -> datetime | None:
    if value is None:
        return None
    try:
        dt = pd.to_datetime(value, errors='coerce')
        if pd.isna(dt):
            return None
        return dt.to_pydatetime()
    except Exception:
        return None


def safe_days_between(a, b) -> int | None:
    da = parse_date(a)
    db = parse_date(b)
    if not da or not db:
        return None
    return (db - da).days
