import pandas as pd

def assert_gates(df: pd.DataFrame) -> None:
    """Asserts data quality gates."""
    
    # Null keys check (assuming keys are attached)
    key_cols = ['date_key', 'user_key', 'device_key', 'location_key', 'channel_key']
    for col in key_cols:
        if col in df.columns:
            if df[col].isnull().any():
                raise ValueError(f"Quality gate failed: Null values found in {col}")
                
    # Revenue integrity check
    if 'payment_status' in df.columns and 'order_amount' in df.columns:
        success_orders = df[df['payment_status'] == 'success']
        if (success_orders['order_amount'] <= 0).any() or success_orders['order_amount'].isnull().any():
            raise ValueError("Quality gate failed: Successful orders must have positive order_amount")
    
    # We could also do Funnel monotonic sanity check here, but that is a soft gate
