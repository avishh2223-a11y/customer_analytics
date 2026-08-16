import shap
import matplotlib.pyplot as plt
import pandas as pd
from src.utils.logger import get_logger

logger = get_logger(__name__)

class ExplanationService:
    def __init__(self, model):
        self.model = model
        self.explainer = shap.TreeExplainer(self.model)

    def generate_waterfall(self, X_encoded: pd.DataFrame):
        """Generates a SHAP waterfall plot for a single customer."""
        shap_exp = self.explainer(X_encoded)
        
        fig, ax = plt.subplots(figsize=(8, 5))
        shap.plots.waterfall(shap_exp[0], show=False)
        plt.tight_layout()
        return fig
    