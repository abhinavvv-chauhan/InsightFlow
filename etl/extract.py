import pandas as pd
from typing import Iterator

def read_csv_chunks(source_path: str, chunksize: int = 50000) -> Iterator[pd.DataFrame]:
    """Reads a CSV file in chunks."""
    for chunk in pd.read_csv(source_path, chunksize=chunksize):
        yield chunk
