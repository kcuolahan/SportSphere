"""
SportSphere NBA Pipeline
Run: python scripts/nba/setup.py

This script:
1. Tests NBA API connection
2. Fetches top 100 players by scoring
3. Calculates season averages and prop lines
4. Applies Edge/Vol filtering (same methodology as AFL model)
5. Outputs to data/nba_players.csv
"""

import sys
import time
import os


def test_connection():
    try:
        from nba_api.stats.static import players
        all_players = players.get_active_players()
        print(f"NBA API connected. {len(all_players)} active players found.")
        return True
    except ImportError:
        print("NBA API not installed. Run: pip install nba_api pandas")
        return False
    except Exception as e:
        print(f"NBA API connection failed: {e}")
        return False


def get_player_averages(season='2024-25', top_n=100):
    from nba_api.stats.endpoints import LeagueDashPlayerStats

    print(f"Fetching player stats for {season}...")
    time.sleep(1)  # Rate limiting

    stats = LeagueDashPlayerStats(
        season=season,
        per_mode_simple='PerGame'
    )

    df = stats.get_data_frames()[0]

    cols = [
        'PLAYER_ID', 'PLAYER_NAME', 'TEAM_ABBREVIATION',
        'GP', 'MIN', 'PTS', 'REB', 'AST',
        'FG_PCT', 'FG3_PCT', 'FT_PCT',
        'STL', 'BLK', 'TOV', 'PLUS_MINUS'
    ]

    df = df[cols].copy()
    df.columns = [
        'player_id', 'player_name', 'team',
        'games', 'minutes', 'points', 'rebounds', 'assists',
        'fg_pct', 'fg3_pct', 'ft_pct',
        'steals', 'blocks', 'turnovers', 'plus_minus'
    ]

    # Round prop lines to nearest 0.5
    df['points_line'] = (df['points'] * 2).round() / 2
    df['rebounds_line'] = (df['rebounds'] * 2).round() / 2
    df['assists_line'] = (df['assists'] * 2).round() / 2

    # Sort by points, take top N
    df = df.sort_values('points', ascending=False)

    return df.head(top_n)


def calculate_edge_vol(df):
    """
    Calculate Edge/Vol for NBA props.
    Same HC tier methodology as AFL disposal model:
    - Edge = (model projection) - (bookmaker line)
    - Vol = estimated standard deviation (~25% of mean)
    - E/V >= 0.50 = HC tier (publishable signal)
    """
    import numpy as np

    df = df.copy()

    # Points edge
    df['points_edge'] = df['points'] - df['points_line']
    df['points_std'] = (df['points'] * 0.25).clip(lower=0.1)
    df['points_ev'] = df['points_edge'] / df['points_std']

    # Rebounds edge
    df['rebounds_edge'] = df['rebounds'] - df['rebounds_line']
    df['rebounds_std'] = (df['rebounds'] * 0.30).clip(lower=0.1)
    df['rebounds_ev'] = df['rebounds_edge'] / df['rebounds_std']

    # Assists edge
    df['assists_edge'] = df['assists'] - df['assists_line']
    df['assists_std'] = (df['assists'] * 0.35).clip(lower=0.1)
    df['assists_ev'] = df['assists_edge'] / df['assists_std']

    # HC filter: E/V >= 0.50 (same threshold as AFL)
    df['points_hc'] = df['points_ev'].abs() >= 0.50
    df['points_direction'] = df['points_edge'].apply(
        lambda x: 'OVER' if x > 0 else 'UNDER'
    )

    return df


if __name__ == '__main__':
    if not test_connection():
        sys.exit(1)

    df = get_player_averages(season='2024-25', top_n=100)
    df = calculate_edge_vol(df)

    os.makedirs('data', exist_ok=True)
    df.to_csv('data/nba_players.csv', index=False)
    print(f"\nSaved {len(df)} players to data/nba_players.csv")

    print(f"\nTop 10 NBA players by points:")
    display_cols = ['player_name', 'team', 'points', 'points_line', 'points_ev', 'points_direction', 'points_hc']
    print(df[display_cols].head(10).to_string())

    hc_picks = df[df['points_hc'] == True]
    print(f"\nHC picks (E/V >= 0.50): {len(hc_picks)}")
    if len(hc_picks) > 0:
        print(hc_picks[['player_name', 'points_direction', 'points_line', 'points_ev']].to_string())
