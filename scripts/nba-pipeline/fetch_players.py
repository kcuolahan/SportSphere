import pandas as pd
from nba_api.stats.static import players
import os

def get_active_players():
    all_players = players.get_active_players()
    df = pd.DataFrame(all_players)
    df = df[['id', 'full_name', 'is_active']]
    df.columns = ['nba_id', 'name', 'is_active']
    return df

if __name__ == '__main__':
    df = get_active_players()
    print(f'Found {len(df)} active NBA players')
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/nba_players.csv', index=False)
    print('Saved to data/nba_players.csv')
