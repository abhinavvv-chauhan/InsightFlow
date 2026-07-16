import pandas as pd
import numpy as np

def enrich(df: pd.DataFrame) -> pd.DataFrame:
    """Derives new fields and enriches the dataset."""
    
    # Derive channel_group
    if 'traffic_source' in df.columns:
        conditions = [
            df['traffic_source'].isin(['google', 'meta', 'ads']),
            df['traffic_source'] == 'direct'
        ]
        choices = ['paid', 'direct']
        df['channel_group'] = np.select(conditions, choices, default='organic')
    
    # Derive device attributes
    if 'device' in df.columns:
        df['is_mobile'] = df['device'].isin(['android', 'ios', 'mobile'])
        df['os_family'] = df['device'].apply(lambda x: 'android' if x == 'android' else ('ios' if x == 'ios' else 'desktop'))
        
    # Derive location attributes
    if 'city' in df.columns:
        tier_1 = ['bangalore', 'mumbai', 'delhi', 'chennai', 'hyderabad', 'pune', 'kolkata']
        df['tier'] = df['city'].apply(lambda x: '1' if x in tier_1 else '2')
        df['region'] = 'unknown' # Could be enriched via a mapping

    # User type (new/returning) will be determined during dimension keys generation/lookup
    return df
