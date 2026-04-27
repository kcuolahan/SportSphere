import pandas as pd
import numpy as np

def calculate_player_averages(game_logs_df: pd.DataFrame) -> pd.DataFrame:
    stats = game_logs_df.groupby('player_name').agg(
        games=('PTS', 'count'),
        avg_points=('PTS', 'mean'),
        avg_rebounds=('REB', 'mean'),
        avg_assists=('AST', 'mean'),
        avg_minutes=('MIN', 'mean'),
        std_points=('PTS', 'std'),
        std_rebounds=('REB', 'std'),
        std_assists=('AST', 'std'),
    ).reset_index()

    for col in ['avg_points', 'avg_rebounds', 'avg_assists', 'avg_minutes']:
        stats[col] = stats[col].round(1)

    stats['points_line'] = (stats['avg_points'] * 2).round() / 2
    stats['rebounds_line'] = (stats['avg_rebounds'] * 2).round() / 2
    stats['assists_line'] = (stats['avg_assists'] * 2).round() / 2

    stats['points_edge'] = stats['avg_points'] - stats['points_line']
    stats['points_ev'] = stats['points_edge'] / stats['std_points'].clip(lower=0.1)

    return stats

if __name__ == '__main__':
    df = pd.read_csv('data/nba_game_logs.csv')
    averages = calculate_player_averages(df)
    averages.to_csv('data/nba_averages.csv', index=False)
    print(f'Calculated averages for {len(averages)} players')
    print(averages.head(10).to_string())
