import pandas as pd
import pickle
import shap
import glob

from src.config import SAVED_MODELS_DIR, PROCESSED_DATA_PATH
from src.utils.logger import get_logger

logger = get_logger(__name__)

def verify_shap_compatibility():
    logger.info("Verifying LightGBM compatibility with SHAP TreeExplainer...")
    
    # 1. Dynamically find the latest bundle
    bundle_files = glob.glob(str(SAVED_MODELS_DIR / "churn_prediction_bundle_*.pkl"))
    if not bundle_files:
        logger.error("No artifact bundle found. Please run package_artifacts.py first.")
        return
        
    bundle_path = bundle_files[-1]
    
    # 2. Load the Artifact
    with open(bundle_path, 'rb') as f:
        bundle = pickle.load(f)
        
    champion_model = bundle['model']
    logger.info(f"Loaded Artifact: {bundle_path.split('/')[-1] if '/' in bundle_path else bundle_path.split(chr(92))[-1]}")
    logger.info(f"Model Engine Confirmed: {bundle['model_type']}")
    
    try:
        # 3. Initialize the TreeExplainer (The core compatibility test)
        logger.info("Instantiating shap.TreeExplainer (Testing C++ tree parsing)...")
        explainer = shap.TreeExplainer(champion_model)
        logger.info("SUCCESS: Champion model is fully compatible with shap.TreeExplainer.")
        
        # 4. Run a tiny inference test to ensure math calculations execute without crashing
        logger.info("Testing SHAP value generation on a 5-row sample...")
        df = pd.read_csv(PROCESSED_DATA_PATH)
        X_sample = df.drop('Churn', axis=1).head(5)
        
        shap_values = explainer.shap_values(X_sample)
        logger.info("SUCCESS: SHAP matrix generated successfully.")
        logger.info("The model is 100% ready for Explainable AI (XAI) implementation.")
        
    except Exception as e:
        logger.error(f"SHAP Compatibility Test Failed: {e}")

if __name__ == "__main__":
    verify_shap_compatibility()