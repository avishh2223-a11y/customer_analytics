import pandas as pd
import pickle
import glob
from typing import Dict, Tuple
from src.config import SAVED_MODELS_DIR
from src.utils.logger import get_logger

logger = get_logger(__name__)

class PredictionService:
    def __init__(self):
        self.bundle = self._load_artifact()
        self.model = self.bundle['model']
        self.encoders = self.bundle['encoders']
        self.features = self.bundle['features']
        
    def _load_artifact(self) -> dict:
        """Loads the latest deployment artifact."""
        bundle_files = glob.glob(str(SAVED_MODELS_DIR / "churn_prediction_bundle_*.pkl"))
        if not bundle_files:
            raise FileNotFoundError("Deployment artifact missing.")
        with open(sorted(bundle_files)[-1], 'rb') as f:
            return pickle.load(f)

    def predict(self, raw_data: Dict) -> Tuple[int, float, pd.DataFrame]:
        """Preprocesses input and returns prediction, probability, and encoded dataframe."""
        df = pd.DataFrame([raw_data])
        
        # Apply strict schema and encoding
        for col in self.features:
            if col in self.encoders:
                # Handle unseen categories gracefully by defaulting to mode/first class
                known_classes = self.encoders[col].classes_
                df[col] = df[col].apply(lambda x: x if x in known_classes else known_classes[0])
                df[col] = self.encoders[col].transform(df[col])
        
        # Ensure column order matches training exactly
        X = df[self.features]
        
        probability = float(self.model.predict_proba(X)[0][1])
        prediction = int(self.model.predict(X)[0])
        
        return prediction, probability, X
    