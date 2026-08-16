import pandas as pd
import numpy as np
import pickle
from sklearn.preprocessing import LabelEncoder

from src.config import SAVED_MODELS_DIR
from src.data.data_loader import DataLoader
from src.utils.logger import get_logger

logger = get_logger(__name__)

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Handles missing values and drops useless columns."""
    logger.info("Cleaning missing values and dropping IDs...")
    
    # 1. Drop customerID (Algorithms can't learn from random IDs)
    if 'customerID' in df.columns:
        df = df.drop('customerID', axis=1)
        
    # 2. Fix the hidden blank spaces in TotalCharges
    # Replace empty spaces with NaN, convert to float (decimal), fill NaNs with 0
    if 'TotalCharges' in df.columns:
        df['TotalCharges'] = df['TotalCharges'].replace(" ", np.nan).astype(float)
        df['TotalCharges'] = df['TotalCharges'].fillna(0.0)
        
    return df

def encode_categorical_data(df: pd.DataFrame):
    """Converts text columns (like 'Yes'/'No') into numbers (1/0)."""
    logger.info("Encoding text categories into numbers...")
    
    encoders = {}
    
    # Find all columns that contain text data (object type)
    text_columns = df.select_dtypes(include=['object']).columns
    
    for col in text_columns:
        le = LabelEncoder()
        # Train the encoder and transform the column at the same time
        df[col] = le.fit_transform(df[col])
        # Save the trained encoder into our dictionary
        encoders[col] = le
        
    return df, encoders

def save_encoders(encoders: dict):
    """Saves the transformation rules to disk for future use."""
    save_path = SAVED_MODELS_DIR / "preprocessing" / "label_encoders.pkl"
    
    with open(save_path, 'wb') as f:
        pickle.dump(encoders, f)
    logger.info(f"Successfully saved encoding rules to {save_path}")

def run_preprocessing_pipeline():
    logger.info("Starting Data Preprocessing Pipeline...")
    
    # 1. Load Raw Data
    df = DataLoader.load_raw_data()
    
    # 2. Clean the Data
    df_cleaned = clean_data(df)
    
    # 3. Encode text to numbers
    df_processed, encoders = encode_categorical_data(df_cleaned)
    
    # 4. Save the Machine-Learning-Ready Data
    DataLoader.save_processed_data(df_processed)
    
    # 5. Save the Encoders
    save_encoders(encoders)
    
    logger.info("Preprocessing Complete! Data is 100% numeric and ready for modeling.")

if __name__ == "__main__":
    run_preprocessing_pipeline()