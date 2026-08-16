import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from src.config import FIGURES_DIR
from src.data.data_loader import DataLoader
from src.utils.logger import get_logger

# Initialize Logger
logger = get_logger(__name__)

# Set academic plotting style
sns.set_theme(style="whitegrid")

def plot_churn_balance(df: pd.DataFrame):
    """Plots how many people churned vs stayed."""
    plt.figure(figsize=(6, 4))
    sns.countplot(data=df, x='Churn', palette="Set2")
    plt.title("Customer Churn Distribution", fontsize=14, pad=10)
    plt.ylabel("Number of Customers")
    plt.xlabel("Churn Status")
    
    save_path = FIGURES_DIR / "01_churn_distribution.png"
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
    logger.info(f"Saved: {save_path}")

def plot_tenure_impact(df: pd.DataFrame):
    """Plots how long people stay (tenure) before churning."""
    plt.figure(figsize=(8, 5))
    sns.kdeplot(data=df, x='tenure', hue='Churn', fill=True, palette="Set1", common_norm=False)
    plt.title("Customer Tenure vs Churn Probability", fontsize=14, pad=10)
    plt.xlabel("Tenure (Months)")
    plt.ylabel("Density")
    
    save_path = FIGURES_DIR / "02_tenure_vs_churn.png"
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
    logger.info(f"Saved: {save_path}")

def plot_contract_impact(df: pd.DataFrame):
    """Plots how contract types affect churn."""
    plt.figure(figsize=(8, 5))
    sns.countplot(data=df, x='Contract', hue='Churn', palette="Pastel1")
    plt.title("Churn Rate by Contract Type", fontsize=14, pad=10)
    plt.xlabel("Contract Type")
    plt.ylabel("Number of Customers")
    
    save_path = FIGURES_DIR / "03_contract_vs_churn.png"
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
    logger.info(f"Saved: {save_path}")

def run_eda():
    logger.info("Starting EDA Pipeline...")
    
    # Load the data using our Module 1 tool!
    df = DataLoader.load_raw_data()
    
    # Run the plotting functions
    plot_churn_balance(df)
    plot_tenure_impact(df)
    plot_contract_impact(df)
    
    logger.info("EDA Complete! Check the 'reports/figures/' folder.")

if __name__ == "__main__":
    run_eda()