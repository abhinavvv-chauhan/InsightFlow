import pandas as pd

EXPECTED_COLUMNS = {
    "session_id", "user_id", "timestamp", "event_type", 
    "device", "city", "browser", "country", "traffic_source", 
    "campaign"
    # product_id, order_id, order_amount, quantity, payment_method, payment_status may be optional
}

EXPECTED_EVENT_TYPES = {
    "page_view", "search", "product_view", "add_to_cart", 
    "checkout", "payment", "purchase"
}

def schema(df: pd.DataFrame) -> None:
    """Validates the schema of the dataframe against constraints. Hard gate."""
    missing_cols = EXPECTED_COLUMNS - set(df.columns)
    if missing_cols:
        raise ValueError(f"Schema validation failed. Missing expected columns: {missing_cols}")
    
    invalid_events = set(df['event_type'].dropna().unique()) - EXPECTED_EVENT_TYPES
    if invalid_events:
        raise ValueError(f"Schema validation failed. Invalid event types found: {invalid_events}")
