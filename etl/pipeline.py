import hashlib
import logging
import pandas as pd
import argparse
from datetime import datetime, timezone
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from etl import extract, validate, clean, transform, keys, load, quality, watermark
from utils.db import get_connection
from utils.logger import setup_logger

log = setup_logger("insightflow.etl")

def run(source_path: str, mode: str = "incremental") -> dict:
    run_id = keys.new_run_id()
    started_at = datetime.now(timezone.utc)
    log.info(f"Starting ETL run {run_id} for file {source_path} (mode: {mode})")
    
    with open(source_path, "rb") as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()
        
    if mode == "incremental" and load.already_ingested(file_hash):
        log.info(f"Skipping already-ingested file {source_path}")
        return {"run_id": run_id, "status": "skipped"}

    frames = []
    rows_in = 0
    
    try:
        # EXTRACT & VALIDATE & TRANSFORM (Chunked)
        for chunk in extract.read_csv_chunks(source_path):
            validate.schema(chunk) # hard gate
            chunk = clean.normalize(chunk)
            chunk = clean.dedupe(chunk)
            chunk = clean.handle_missing(chunk)
            chunk = transform.enrich(chunk)
            frames.append(chunk)
            rows_in += len(chunk)
            
        if not frames:
            log.warning("No rows extracted from file.")
            return {"run_id": run_id, "status": "success", "rows_loaded": 0}
            
        df = pd.concat(frames, ignore_index=True)
        
        # INCREMENTAL FILTER
        if mode == "incremental":
            last_ts_str = watermark.get('fact_events')
            last_ts = pd.to_datetime(last_ts_str)
            df = df[df["event_ts"] > last_ts]
            
        log.info(f"Processing {len(df)} rows after incremental filter.")
        
        if df.empty:
            load.write_run_log(run_id, source_file=source_path, file_hash=file_hash, rows_in=rows_in, rows_loaded=0, rows_quarantined=0, status="success", started_at=started_at, finished_at=datetime.now(timezone.utc))
            return {"run_id": run_id, "status": "success", "rows_loaded": 0}
        
        # EXTRACT DIMENSIONS
        dims = keys.extract_dimensions(df)
        
        # LOAD
        from utils.db import transaction
        with transaction() as tx:
            # Upsert dimensions
            load.upsert_dims(tx, dims)
            
            # Fetch new keys mappings
            key_maps = load.fetch_dim_keys(tx)
            
            # Attach surrogate keys to facts
            facts = keys.attach_surrogate_keys(df, key_maps)
            
            # Data quality checks
            quality.assert_gates(facts) # hard gates
            
            # Insert facts
            loaded = load.insert_facts(tx, facts)
            
            # Advance watermark
            max_ts = facts["event_ts"].max()
            watermark.advance(tx, 'fact_events', max_ts.isoformat())
            
        # Refresh materialized views (outside the main transaction block)
        load.refresh_materialized_views()
        
        # Write run log
        finished_at = datetime.now(timezone.utc)
        load.write_run_log(run_id, source_file=source_path, file_hash=file_hash, rows_in=rows_in, rows_loaded=loaded, rows_quarantined=0, status="success", started_at=started_at, finished_at=finished_at)
        
        log.info(f"ETL run {run_id} completed successfully. Loaded {loaded} rows.")
        return {"run_id": run_id, "status": "success", "rows_loaded": loaded}
        
    except Exception as e:
        log.error(f"ETL run {run_id} failed: {e}")
        finished_at = datetime.now(timezone.utc)
        load.write_run_log(run_id, source_file=source_path, file_hash=file_hash, rows_in=rows_in, rows_loaded=0, rows_quarantined=0, status="failed", started_at=started_at, finished_at=finished_at, error_message=str(e))
        raise e

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True, help="Path to raw CSV file")
    parser.add_argument("--mode", default="incremental", choices=["incremental", "full"])
    args = parser.parse_args()
    run(args.file, args.mode)
