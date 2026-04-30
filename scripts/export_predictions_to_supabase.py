"""
Export AFL model predictions from Excel to Supabase via the seed endpoint.

Usage:
  python scripts/export_predictions_to_supabase.py --round 8 --file "Disposal_Model_-_Round_8.xlsx"

Requires:
  pip install pandas openpyxl requests
"""

import argparse
import json
import math
import sys

import pandas as pd
import requests

SEED_URL = "https://sportsphere.com.au/api/admin/seed-predictions-full"
AUTH_TOKEN = "sportsphereadmin2026"

# Excel column → DB column mapping
COLUMN_MAP = {
    "Player": "player",
    "Team": "team",
    "Opponent": "opponent",
    "Position": "position",
    "Effective Position": "effective_position",
    "Bookie Line": "bookie_line",
    "PREDICTED": "predicted_line",
    "Edge": "edge",
    "Signal": "signal",
    "Confidence": "confidence",
    "Enhanced Signal": "enhanced_signal",
    "Edge/Vol Score": "edge_vol_score",
    "Est Std Dev": "est_std_dev",
    "Pos Threshold": "pos_threshold",
    "Bet Score": "bet_score",
    "Pred TOG": "pred_tog",
    "Avg 2025": "avg_2025",
    "Avg 2026": "avg_2026",
    "Blended Avg": "blended_avg",
    "Opp Factor": "opp_factor",
    "TOG Rate": "tog_rate",
    "CBA Adj": "cba_adj",
    "Style": "style",
    "Conditions": "conditions",
    "Rules Boost": "rules_boost",
    "Avail Boost": "avail_boost",
    "Form Indicator": "form_indicator",
    "Games": "games",
    "Venue": "venue",
    "Game ID": "game_id",
    "Game Time": "game_time",
    "Last5 Disposals": "last5_disposals",
    "Divergence %": "divergence_pct",
    "Context Flag": "context_flag",
    "Sample Confidence": "sample_confidence",
    "Role Swap": "role_swap",
    "Avg CBA %": "avg_cba_pct",
}


def clean_value(v):
    """Convert NaN / inf to None for JSON serialisation."""
    if v is None:
        return None
    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
        return None
    # pandas Timestamp → ISO string
    if hasattr(v, "isoformat"):
        return v.isoformat()
    return v


def load_predictions(filepath: str) -> pd.DataFrame:
    xl = pd.ExcelFile(filepath)
    sheet = "Predictions" if "Predictions" in xl.sheet_names else xl.sheet_names[0]
    print(f"  Reading sheet: '{sheet}'")
    df = pd.read_excel(filepath, sheet_name=sheet)
    print(f"  Rows read: {len(df)}  |  Columns: {list(df.columns)}")
    return df


def map_columns(df: pd.DataFrame) -> list[dict]:
    rows = []
    for _, row in df.iterrows():
        record: dict = {}
        for excel_col, db_col in COLUMN_MAP.items():
            if excel_col in df.columns:
                record[db_col] = clean_value(row[excel_col])
        # Skip rows with no player name
        if not record.get("player"):
            continue
        rows.append(record)
    return rows


def post_to_supabase(round_num: int, rows: list[dict], base_url: str) -> None:
    url = base_url.rstrip("/")
    if not url.endswith("/api/admin/seed-predictions-full"):
        url = url + "/api/admin/seed-predictions-full"

    payload = {"round": round_num, "predictions": rows}
    headers = {
        "Authorization": f"Bearer {AUTH_TOKEN}",
        "Content-Type": "application/json",
    }

    print(f"\n  POST {url}")
    print(f"  Sending {len(rows)} prediction rows for round {round_num}...")

    resp = requests.post(url, headers=headers, data=json.dumps(payload), timeout=60)
    try:
        data = resp.json()
    except Exception:
        data = {"raw": resp.text}

    if resp.status_code == 200 and data.get("success"):
        print(f"  ✓ Upserted {data.get('upserted', '?')} rows (round {data.get('round')}, season {data.get('season')})")
    else:
        print(f"  ✗ Error {resp.status_code}: {data}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Export AFL predictions to Supabase")
    parser.add_argument("--round", type=int, required=True, help="AFL round number")
    parser.add_argument("--file", required=True, help="Path to Excel file")
    parser.add_argument(
        "--url",
        default="https://sportsphere.com.au",
        help="Base URL of the Next.js app (default: https://sportsphere.com.au)",
    )
    parser.add_argument("--dry-run", action="store_true", help="Parse and print rows but do not POST")
    args = parser.parse_args()

    print(f"\n=== SportSphere Predictions Export — Round {args.round} ===")
    print(f"  File: {args.file}")

    df = load_predictions(args.file)
    rows = map_columns(df)
    print(f"  Mapped {len(rows)} valid rows")

    if args.dry_run:
        print("\n  [DRY RUN] First 3 rows:")
        for r in rows[:3]:
            print(" ", json.dumps(r, indent=2, default=str))
        print("\n  Dry run complete — nothing sent.")
        return

    post_to_supabase(args.round, rows, args.url)
    print("\nDone.\n")


if __name__ == "__main__":
    main()
