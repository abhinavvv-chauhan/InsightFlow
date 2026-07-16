import os
import sys
import urllib.request
import zipfile
import subprocess
import time
from dotenv import load_dotenv

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.logger import setup_logger

logger = setup_logger("insightflow.install_postgres")

# Public Enterprisedb URL for PostgreSQL 16.3 binaries
POSTGRES_ZIP_URL = "https://sbp.enterprisedb.com/get/db_download?file=postgresql-16.3-1-windows-x64-binaries.zip"
ZIP_PATH = "postgres-bin.zip"
EXTRACT_DIR = "postgres-bin"

def download_file(url, dest):
    logger.info(f"Downloading PostgreSQL binaries from {url}...")
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    req = urllib.request.Request(url, headers=headers)
    
    with urllib.request.urlopen(req) as response, open(dest, 'wb') as out_file:
        meta = response.info()
        file_size = int(meta.get("Content-Length", 0))
        logger.info(f"File size: {file_size / (1024*1024):.2f} MB")
        
        downloaded = 0
        block_size = 8192
        last_pct = -1
        
        while True:
            buffer = response.read(block_size)
            if not buffer:
                break
            downloaded += len(buffer)
            out_file.write(buffer)
            
            if file_size > 0:
                pct = int(downloaded * 100 / file_size)
                if pct % 10 == 0 and pct != last_pct:
                    logger.info(f"Download progress: {pct}%")
                    last_pct = pct
                    
    logger.info("Download completed successfully.")

def extract_zip(zip_path, dest_dir):
    logger.info(f"Extracting {zip_path} to {dest_dir}...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(dest_dir)
    logger.info("Extraction completed successfully.")

def run_command(cmd, shell=True):
    logger.info(f"Running command: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    res = subprocess.run(cmd, shell=shell, capture_output=True, text=True)
    if res.returncode != 0:
        logger.error(f"Command failed with exit code {res.returncode}")
        logger.error(f"Stdout: {res.stdout}")
        logger.error(f"Stderr: {res.stderr}")
        raise RuntimeError(f"Command failed: {cmd}")
    else:
        logger.info("Command completed successfully.")
        if res.stdout:
            logger.info(f"Stdout: {res.stdout}")
    return res

def main():
    # 1. Download if not exists
    if not os.path.exists(ZIP_PATH) and not os.path.exists(EXTRACT_DIR):
        download_file(POSTGRES_ZIP_URL, ZIP_PATH)
        
    # 2. Extract if not exists
    pgsql_dir = os.path.join(EXTRACT_DIR, "pgsql")
    if not os.path.exists(pgsql_dir):
        extract_zip(ZIP_PATH, EXTRACT_DIR)
        # Clean up zip
        try:
            os.remove(ZIP_PATH)
            logger.info("Removed temporary zip file.")
        except Exception as e:
            logger.warning(f"Could not remove zip file: {e}")
            
    # 3. Setup data directory
    data_dir = os.path.join(EXTRACT_DIR, "data")
    bin_dir = os.path.join(pgsql_dir, "bin")
    initdb_path = os.path.join(bin_dir, "initdb.exe")
    pg_ctl_path = os.path.join(bin_dir, "pg_ctl.exe")
    
    if not os.path.exists(data_dir):
        logger.info("Initializing PostgreSQL database cluster (initdb)...")
        # Run initdb
        cmd = [
            f'"{initdb_path}"',
            f'-D "{data_dir}"',
            '-U postgres',
            '--auth-host=trust',
            '--auth-local=trust'
        ]
        run_command(" ".join(cmd))
    else:
        logger.info("Database cluster already initialized.")
        
    # 4. Start database server
    logger.info("Starting PostgreSQL database server...")
    logfile = os.path.join(EXTRACT_DIR, "logfile")
    # Start pg_ctl in background
    cmd = f'"{pg_ctl_path}" -D "{data_dir}" -l "{logfile}" -o "-F -p 5432" start'
    logger.info(f"Running: {cmd}")
    subprocess.Popen(cmd, shell=True)
    
    # Wait a few seconds to let it start
    time.sleep(5)
    logger.info("Checking if database is running...")
    status_cmd = f'"{pg_ctl_path}" -D "{data_dir}" status'
    res = subprocess.run(status_cmd, shell=True, capture_output=True, text=True)
    logger.info(res.stdout or res.stderr)
    
    logger.info("PostgreSQL is successfully installed and running locally on port 5432!")

if __name__ == "__main__":
    main()
