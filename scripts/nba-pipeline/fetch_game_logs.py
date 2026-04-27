import pandas as pd
from nba_api.stats.endpoints import PlayerGameLog
from nba_api.stats.static import players
import time
import os

def get_player_game_log(player_id: int, season: str = '2024-25') -> pd.DataFrame:
    try:
        gamelog = PlayerGameLog(player_id=player_id, season=season)
        time.sleep(0.6)  # rate limiting
        df = gamelog.get_data_frames()[0]
        return df[['GAME_DATE', 'MATCHUP', 'PTS', 'REB', 'AST', 'MIN', 'FGA', 'FG_PCT']]
    except Exception as e:
        print(f'Error fetching player {player_id}: {e}')
        return pd.DataFrame()

def get_top_players_logs(top_n: int = 100):
    all_players = players.get_active_players()
    results = []

    for i, player in enumerate(all_players[:top_n]):
        print(f'Fetching {player["full_name"]} ({i+1}/{top_n})')
        df = get_player_game_log(player['id'])
        if not df.empty:
            df['player_name'] = player['full_name']
            df['player_id'] = player['id']
            results.append(df)

    if results:
        combined = pd.concat(results, ignore_index=True)
        os.makedirs('data', exist_ok=True)
        combined.to_csv('data/nba_game_logs.csv', index=False)
        print(f'Saved {len(combined)} game log entries')
        return combined
    return pd.DataFrame()

if __name__ == '__main__':
    df = get_top_players_logs(top_n=100)
    print(df.head())
