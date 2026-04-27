import pandas as pd
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

def seed_nba_players(averages_df: pd.DataFrame):
    url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

    if not url or not key:
        print('Missing Supabase credentials in .env')
        return

    supabase = create_client(url, key)

    records = []
    for _, row in averages_df.iterrows():
        records.append({
            'player_name': row['player_name'],
            'sport': 'NBA',
            'season': 2025,
            'games_played': int(row['games']),
            'avg_points': float(row['avg_points']),
            'avg_rebounds': float(row['avg_rebounds']),
            'avg_assists': float(row['avg_assists']),
            'points_line': float(row['points_line']),
            'rebounds_line': float(row['rebounds_line']),
            'assists_line': float(row['assists_line']),
            'points_ev': float(row['points_ev']),
        })

    result = supabase.table('nba_players').upsert(records).execute()
    print(f'Seeded {len(records)} NBA players to Supabase')
    return result

if __name__ == '__main__':
    df = pd.read_csv('data/nba_averages.csv')
    seed_nba_players(df)
