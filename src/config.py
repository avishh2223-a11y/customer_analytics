from pathlib import Path

# 1. Find the main project folder automatically
# This looks at where config.py is, and goes up two levels.
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# 2. Define where our data will live
DATA_DIR = PROJECT_ROOT / "data"
RAW_DATA_PATH = DATA_DIR / "raw" / "Telco-Customer-Churn.csv"
PROCESSED_DATA_PATH = DATA_DIR / "processed" / "cleaned_churn_data.csv"

# 3. Define where our models and reports will live
SAVED_MODELS_DIR = PROJECT_ROOT / "saved_models"
REPORTS_DIR = PROJECT_ROOT / "reports"

def initialize_directories():
    """
    This function acts like a robot builder. 
    It creates all our empty folders for us so we don't have to right-click and make them one by one.
    """
    directories_to_create = [
        DATA_DIR / "raw",
        DATA_DIR / "processed",
        SAVED_MODELS_DIR / "models",
        SAVED_MODELS_DIR / "preprocessing",
        REPORTS_DIR / "figures",
        REPORTS_DIR / "metrics",
        REPORTS_DIR / "thesis",
    ]
    
    # Loop through the list and create each folder
    for directory in directories_to_create:
        directory.mkdir(parents=True, exist_ok=True)

# 4. If we run this file directly, execute the robot builder
if __name__ == "__main__":
    initialize_directories()
    print("Success! All project folders have been created.")