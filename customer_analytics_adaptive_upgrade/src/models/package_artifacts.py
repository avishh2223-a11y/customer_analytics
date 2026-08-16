import pandas as pd
import pickle
from datetime import datetime

from src.config import SAVED_MODELS_DIR, PROCESSED_DATA_PATH
from src.utils.logger import get_logger

logger = get_logger(__name__)

def package_model_artifacts():
    logger.info("Starting Model Artifact Packaging...")
    
    # 1. Load Champion Model (from Task 6)
    champion_path = SAVED_MODELS_DIR / "champion_lightgbm.pkl"
    with open(champion_path, 'rb') as f:
        champion_model = pickle.load(f)
        
    # 2. Load Preprocessing Encoders (from Task 3 / Module 3)
    encoders_path = SAVED_MODELS_DIR / "preprocessing" / "label_encoders.pkl"
    with open(encoders_path, 'rb') as f:
        label_encoders = pickle.load(f)
        
    # 3. Extract Feature List (Schema)
    # We need the exact order of columns the model expects.
    logger.info("Extracting feature schema from processed data...")
    df = pd.read_csv(PROCESSED_DATA_PATH)
    features = df.drop('Churn', axis=1).columns.tolist()
    
    # 4. Create the Versioned Bundle Dictionary
    version = "1.0.0"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    deployment_bundle = {
        "version": version,
        "build_date": timestamp,
        "model_type": "LightGBM",
        "features": features,
        "encoders": label_encoders,
        "model": champion_model
    }
    
    # 5. Save the Bundle
    bundle_name = f"churn_prediction_bundle_v{version.replace('.', '_')}.pkl"
    bundle_path = SAVED_MODELS_DIR / bundle_name
    
    with open(bundle_path, 'wb') as f:
        pickle.dump(deployment_bundle, f)
        
    print("\n" + "="*55)
    print(f"            ARTIFACT BUNDLE CREATED")
    print("="*55)
    print(f"File Name:        {bundle_name}")
    print(f"Version:          {version}")
    print(f"Features Tracked: {len(features)} columns")
    print(f"Encoders Tracked: {len(label_encoders)} encoders")
    print(f"Model Engine:     LightGBM")
    print("="*55 + "\n")
    logger.info(f"Artifact bundle successfully saved to {bundle_path}")

if __name__ == "__main__":
    package_model_artifacts()