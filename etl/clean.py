import pandas as pd
import numpy as np

def normalize(df: pd.DataFrame) -> pd.DataFrame:
    """Normalizes whitespace and cases, parses timestamps."""
    # Trim whitespace and lower case string columns
    str_cols = df.select_dtypes(include=['object']).columns
    for col in str_cols:
        df[col] = df[col].astype(str).str.strip().str.lower()
        # Replace empty strings with NaN
        df[col] = df[col].replace('', np.nan)
        df[col] = df[col].replace('nan', np.nan)

    # Parse timestamps
    if 'timestamp' in df.columns:
        df['event_ts'] = pd.to_datetime(df['timestamp'], errors='coerce', utc=True)
    
    return df

def dedupe(df: pd.DataFrame) -> pd.DataFrame:
    """Deduplicates on natural keys."""
    # Deduplicate events
    event_subset = ['user_id', 'session_id', 'event_type', 'event_ts']
    if all(col in df.columns for col in event_subset):
        df = df.drop_duplicates(subset=event_subset)
    
    # Deduplicate orders (if applicable)
    if 'order_id' in df.columns:
        # Keep the last one if order_id is duplicated
        has_order = df['order_id'].notna()
        orders = df[has_order].drop_duplicates(subset=['order_id'], keep='last')
        non_orders = df[~has_order]
        df = pd.concat([orders, non_orders], ignore_index=True)
        
    return df

def handle_missing(df: pd.DataFrame) -> pd.DataFrame:
    """Handles missing values."""
    # Drop rows where timestamp is unparseable
    if 'event_ts' in df.columns:
        df = df.dropna(subset=['event_ts'])
    
    # Fill defaults
    if 'city' in df.columns:
        df['city'] = df['city'].fillna('unknown')
    if 'country' in df.columns:
        df['country'] = df['country'].fillna('unknown')
    if 'campaign' in df.columns:
        df['campaign'] = df['campaign'].fillna('(none)')
    if 'traffic_source' in df.columns:
        df['traffic_source'] = df['traffic_source'].fillna('direct')
        
    return df
