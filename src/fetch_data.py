import kagglehub
import shutil
import os
from pathlib import Path
from src.config import RAW_DATA_PATH

def download_and_move_dataset():
    print("Downloading dataset via kagglehub...")
    # 1. Download to the hidden cache
    cache_path = kagglehub.dataset_download("blastchar/telco-customer-churn")
    print(f"Dataset cached at: {cache_path}")
    
    # 2. Find the CSV file inside the cache folder
    csv_file_name = "WA_Fn-UseC_-Telco-Customer-Churn.csv"
    cached_csv_path = Path(cache_path) / csv_file_name
    
    # 3. Copy it to our project's data/raw folder and rename it properly
    if cached_csv_path.exists():
        print(f"Moving dataset to {RAW_DATA_PATH}...")
        shutil.copy(cached_csv_path, RAW_DATA_PATH)
        print("✅ Dataset successfully placed in data/raw/ !")
    else:
        print(f"❌ Could not find {csv_file_name} in the cache folder.")

if __name__ == "__main__":
    download_and_move_dataset()