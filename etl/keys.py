import pandas as pd
import uuid

def new_run_id() -> str:
    return str(uuid.uuid4())

def extract_dimensions(df: pd.DataFrame) -> dict:
    """Extracts unique dimension records from the dataframe."""
    dims = {}
    
    if 'user_id' in df.columns:
        dims['user'] = df[['user_id', 'traffic_source']].rename(columns={'traffic_source': 'acquisition_channel'}).drop_duplicates('user_id')
        
    if 'device' in df.columns:
        dims['device'] = df[['device', 'browser', 'os_family', 'is_mobile']].drop_duplicates(['device', 'browser'])
        
    if 'city' in df.columns:
        dims['location'] = df[['city', 'country', 'region', 'tier']].drop_duplicates(['city', 'country'])
        
    if 'traffic_source' in df.columns:
        dims['channel'] = df[['traffic_source', 'campaign', 'channel_group']].drop_duplicates(['traffic_source', 'campaign'])
        
    if 'product_id' in df.columns:
        # If we have product data in events
        prod_cols = [c for c in ['product_id', 'product_name', 'category', 'sub_category', 'unit_price'] if c in df.columns]
        if 'product_id' in prod_cols:
            dims['product'] = df[prod_cols].dropna(subset=['product_id']).drop_duplicates('product_id')
            # Add missing columns for product if needed
            for col in ['product_name', 'category', 'sub_category']:
                if col not in dims['product'].columns:
                    dims['product'][col] = 'Unknown'
            if 'unit_price' not in dims['product'].columns:
                dims['product']['unit_price'] = 0.0

    return dims

def attach_surrogate_keys(df: pd.DataFrame, key_maps: dict) -> pd.DataFrame:
    """Attaches surrogate keys using the loaded key mappings."""
    
    # Date key
    df['date_key'] = df['event_ts'].dt.strftime('%Y%m%d').astype(int)
    
    # User key
    if 'user' in key_maps:
        df['user_key'] = df['user_id'].map(key_maps['user'])
        
    # Device key
    if 'device' in key_maps:
        df['device_key'] = df.set_index(['device', 'browser']).index.map(key_maps['device'])
        
    # Location key
    if 'location' in key_maps:
        df['location_key'] = df.set_index(['city', 'country']).index.map(key_maps['location'])
        
    # Channel key
    if 'channel' in key_maps:
        df['channel_key'] = df.set_index(['traffic_source', 'campaign']).index.map(key_maps['channel'])
        
    # Product key
    if 'product' in key_maps and 'product_id' in df.columns:
        df['product_key'] = df['product_id'].map(key_maps['product'])
    else:
        df['product_key'] = None
        
    return df
