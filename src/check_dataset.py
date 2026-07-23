import pandas as pd
from src.config import RAW_DATA_PATH

def inspect_raw_dataset():
    print("=" * 50)
    print("          RAW DATASET DIAGNOSTIC REPORT          ")
    print("=" * 50)
    
    # 1. Load Data
    try:
        df = pd.read_csv(RAW_DATA_PATH)
        print(f"✅ Successfully loaded dataset from:\n   {RAW_DATA_PATH}")
    except FileNotFoundError:
        print(f"❌ ERROR: File not found at {RAW_DATA_PATH}")
        return

    # 2. Dimensions
    print(f"\n1. DATASET SHAPE:")
    print(f"   - Total Rows (Customers): {df.shape[0]}")
    print(f"   - Total Columns (Features): {df.shape[1]}")

    # 3. Data Types & Hidden Anomaly
    print(f"\n2. DATA TYPES SUMMARY:")
    print(f"   - TotalCharges Column Type: {df['TotalCharges'].dtype}")
    blank_spaces = (df['TotalCharges'] == " ").sum()
    print(f"   - Hidden Blank Spaces in TotalCharges: {blank_spaces} rows")

    # 4. Standard Null Values
    print(f"\n3. EXPLICIT NULL VALUES:")
    print(f"   - Total Nulls in Dataset: {df.isnull().sum().sum()}")

    # 5. Target Variable (Churn) Distribution
    if 'Churn' in df.columns:
        print(f"\n4. TARGET VARIABLE (Churn) BALANCE:")
        churn_counts = df['Churn'].value_counts()
        for val in churn_counts.index:
            print(f"   - {val}: {churn_counts[val]}")

    # 6. Duplicates
    duplicates = df.duplicated().sum()
    print(f"\n5. DUPLICATE ROWS: {duplicates}")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    inspect_raw_dataset()