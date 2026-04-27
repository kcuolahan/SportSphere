# NBA Data Pipeline

Pull NBA player prop data via nba_api and seed to Supabase.

## Setup

```
pip install nba_api pandas numpy requests python-dotenv supabase
```

## Files

- `fetch_players.py` - Pull all active NBA players
- `fetch_game_logs.py` - Pull player game logs for current season
- `calculate_props.py` - Calculate player averages and prop lines
- `seed_to_supabase.py` - Upload processed data to Supabase

## Data flow

nba_api (free) -> pandas processing -> Supabase -> SportSphere website

## Key endpoints

```python
from nba_api.stats.endpoints import PlayerGameLog, CommonAllPlayers
from nba_api.stats.static import players
```

## Weekly workflow (NBA season)

1. Run `fetch_game_logs.py` to pull latest game results
2. Run `calculate_props.py` to update player averages
3. Run `seed_to_supabase.py` to push to database
4. Website auto-updates from Supabase

## Environment variables

Copy `.env.example` to `.env` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
