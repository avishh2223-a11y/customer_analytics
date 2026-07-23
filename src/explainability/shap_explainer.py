import pandas as pd
import pickle
import glob
import shap
import matplotlib.pyplot as plt
from typing import Tuple, Dict, Any

from src.config import SAVED_MODELS_DIR, PROCESSED_DATA_PATH, FIGURES_DIR
from src.utils.logger import get_logger

logger = get_logger(__name__)

def load_inference_artifacts() -> Tuple[Any, pd.DataFrame]:
    """Loads the latest deployment bundle and a sample of processed data."""
    logger.info("Locating deployment artifact...")
    bundle_files = glob.glob(str(SAVED_MODELS_DIR / "churn_prediction_bundle_*.pkl"))
    
    if not bundle_files:
        raise FileNotFoundError("Artifact bundle not found. Run package_artifacts.py first.")
        
    latest_bundle = sorted(bundle_files)[-1]
    
    with open(latest_bundle, 'rb') as f:
        bundle = pickle.load(f)
        
    champion_model = bundle['model']
    
    logger.info("Loading background dataset for SHAP...")
    df = pd.read_csv(PROCESSED_DATA_PATH)
    X = df.drop('Churn', axis=1)
    
    return champion_model, X

def initialize_explainer(model: Any, X: pd.DataFrame) -> Tuple[shap.TreeExplainer, shap.Explanation]:
    """Initializes TreeExplainer and computes the full SHAP Explanation object."""
    logger.info("Initializing SHAP TreeExplainer...")
    explainer = shap.TreeExplainer(model)
    
    logger.info("Computing SHAP values for the dataset (this may take a moment)...")
    # Using the newer __call__ API generates a rich Explanation object needed for waterfall plots
    shap_exp = explainer(X)
    
    return explainer, shap_exp

def plot_and_save_summary(shap_exp: shap.Explanation):
    """Generates the standard SHAP summary dot plot."""
    logger.info("Generating SHAP Summary Plot...")
    plt.figure(figsize=(10, 6))
    shap.summary_plot(shap_exp, show=False)
    
    save_path = FIGURES_DIR / "07_shap_summary.png"
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
    logger.info(f"Saved: {save_path}")

def plot_and_save_importance(shap_exp: shap.Explanation):
    """Generates the global feature importance bar chart."""
    logger.info("Generating SHAP Feature Importance Plot...")
    plt.figure(figsize=(10, 6))
    # Taking the absolute mean across all samples for global importance
    shap.plots.bar(shap_exp, show=False)
    
    save_path = FIGURES_DIR / "08_shap_importance.png"
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
    logger.info(f"Saved: {save_path}")

def plot_and_save_dependence(shap_exp: shap.Explanation, feature: str = "MonthlyCharges"):
    """Generates a dependence plot to show non-linear feature interactions."""
    logger.info(f"Generating SHAP Dependence Plot for {feature}...")
    plt.figure(figsize=(8, 5))
    
    # SHAP will automatically select the strongest interacting feature for color coding
    shap.dependence_plot(feature, shap_exp.values, shap_exp.data, feature_names=shap_exp.feature_names, show=False)
    
    save_path = FIGURES_DIR / f"09_shap_dependence_{feature}.png"
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
    logger.info(f"Saved: {save_path}")

def plot_and_save_waterfall(shap_exp: shap.Explanation, customer_index: int = 0):
    """Generates a waterfall plot explaining a single individual's prediction."""
    logger.info(f"Generating SHAP Waterfall Plot for Customer Index {customer_index}...")
    plt.figure(figsize=(10, 6))
    
    shap.plots.waterfall(shap_exp[customer_index], show=False)
    
    save_path = FIGURES_DIR / f"10_shap_waterfall_cust_{customer_index}.png"
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
    logger.info(f"Saved: {save_path}")

def run_explainability_pipeline():
    logger.info("Starting Explainability Pipeline...")
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    
    # 1. Load Model & Data
    model, X = load_inference_artifacts()
    
    # 2. Compute SHAP Math
    explainer, shap_exp = initialize_explainer(model, X)
    
    # 3. Generate Artifacts
    plot_and_save_summary(shap_exp)
    plot_and_save_importance(shap_exp)
    plot_and_save_dependence(shap_exp, feature="MonthlyCharges")
    
    # Isolate and explain Customer #0 (who we will assume is a high-risk churner for demonstration)
    plot_and_save_waterfall(shap_exp, customer_index=0)
    
    logger.info("Explainability Pipeline Complete. All XAI artifacts successfully saved.")

if __name__ == "__main__":
    run_explainability_pipeline()
    