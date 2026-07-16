import pandas as pd
import pytest
from etl import validate, clean, transform, keys

def test_schema_validation_success():
    df = pd.DataFrame({
        'session_id': ['s1'], 'user_id': ['u1'], 'timestamp': ['2026-07-01T10:00:00Z'],
        'event_type': ['page_view'], 'device': ['android'], 'city': ['bangalore'],
        'browser': ['chrome'], 'country': ['India'], 'traffic_source': ['google'],
        'campaign': ['summer_sale']
    })
    # Should not raise exception
    validate.schema(df)

def test_schema_validation_failure_missing_cols():
    df = pd.DataFrame({
        'session_id': ['s1'], 'user_id': ['u1']
    })
    with pytest.raises(ValueError, match="Missing expected columns"):
        validate.schema(df)

def test_schema_validation_failure_invalid_event():
    df = pd.DataFrame({
        'session_id': ['s1'], 'user_id': ['u1'], 'timestamp': ['2026-07-01T10:00:00Z'],
        'event_type': ['invalid_event'], 'device': ['android'], 'city': ['bangalore'],
        'browser': ['chrome'], 'country': ['India'], 'traffic_source': ['google'],
        'campaign': ['summer_sale']
    })
    with pytest.raises(ValueError, match="Invalid event types found"):
        validate.schema(df)

def test_clean_normalize():
    df = pd.DataFrame({
        'city': [' BANGALORE '],
        'timestamp': ['2026-07-01T10:00:00+00:00']
    })
    df_clean = clean.normalize(df)
    assert df_clean['city'].iloc[0] == 'bangalore'
    assert pd.api.types.is_datetime64_any_dtype(df_clean['event_ts'])

def test_transform_enrich():
    df = pd.DataFrame({
        'traffic_source': ['google', 'direct', 'unknown'],
        'device': ['android', 'desktop', 'ios'],
        'city': ['bangalore', 'unknown', 'mumbai']
    })
    df_enriched = transform.enrich(df)
    assert list(df_enriched['channel_group']) == ['paid', 'direct', 'organic']
    assert list(df_enriched['is_mobile']) == [True, False, True]
    assert list(df_enriched['tier']) == ['1', '2', '1']

def test_keys_extract_dimensions():
    df = pd.DataFrame({
        'user_id': ['u1', 'u1', 'u2'],
        'traffic_source': ['google', 'google', 'direct'],
        'campaign': ['c1', 'c2', 'c3'],
        'channel_group': ['paid', 'paid', 'direct'],
        'device': ['android', 'ios', 'android'],
        'browser': ['chrome', 'safari', 'chrome'],
        'os_family': ['android', 'ios', 'android'],
        'is_mobile': [True, True, True]
    })
    dims = keys.extract_dimensions(df)
    assert len(dims['user']) == 2
    assert len(dims['device']) == 2
