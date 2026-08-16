import pandas as pd
from pathlib import Path
from src.config import RAW_DATA_PATH, PROCESSED_DATA_PATH
from src.utils.logger import get_logger

# Initialize our new professional logger
logger = get_logger(__name__)

class DataLoader:
    """A unified interface for loading raw data and saving processed data."""
    
    @staticmethod
    def load_raw_data(file_path: Path = RAW_DATA_PATH) -> pd.DataFrame:
        logger.info(f"Attempting to load raw data from {file_path}")
        try:
            df = pd.read_csv(file_path)
            logger.info(f"Successfully loaded raw data. Shape: {df.shape}")
            return df
        except FileNotFoundError:
            logger.error(f"Dataset not found at {file_path}.")
            raise

    @staticmethod
    def save_processed_data(df: pd.DataFrame, file_path: Path = PROCESSED_DATA_PATH) -> None:
        try:
            df.to_csv(file_path, index=False)
            logger.info(f"Data successfully saved to {file_path}")
        except Exception as e:
            logger.error(f"Failed to save data: {e}")
            raise

if __name__ == "__main__":
    # Test our new professional data loader
    df_raw = DataLoader.load_raw_data()
    # Save a tiny test piece just to make sure our saving function works
    DataLoader.save_processed_data(df_raw.head())