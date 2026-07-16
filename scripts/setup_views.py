import os
import sys
import glob

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.db import get_connection
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def setup_views():
    """Reads all SQL files from sql/views/ and executes them in order."""
    views_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'sql', 'views')
    
    # Get all .sql files in the views directory and sort them by name
    # The 01_, 02_ prefix ensures correct execution order
    sql_files = sorted(glob.glob(os.path.join(views_dir, '*.sql')))
    
    if not sql_files:
        logger.warning(f"No SQL files found in {views_dir}")
        return
        
    with get_connection() as conn:
        with conn.cursor() as cur:
            for sql_file in sql_files:
                file_name = os.path.basename(sql_file)
                logger.info(f"Executing view: {file_name}")
                with open(sql_file, 'r') as f:
                    sql_content = f.read()
                    
                try:
                    cur.execute(sql_content)
                    logger.info(f"Successfully created/updated view from {file_name}")
                except Exception as e:
                    logger.error(f"Error executing {file_name}: {e}")
                    conn.rollback()
                    raise e
            
            conn.commit()
            logger.info("All views created successfully!")

if __name__ == "__main__":
    setup_views()
