import sys
import json
import pandas as pd
import joblib
import lightgbm as lgb
import warnings
from sklearn.exceptions import InconsistentVersionWarning

# Suppress InconsistentVersionWarning
warnings.filterwarnings(action='ignore', category=InconsistentVersionWarning)

def main():
    if len(sys.argv) < 2:
        print("No data provided")
        return

    # Load the model and preprocessing artifacts
    model = joblib.load('/home/sushil/GharKhoji/api/utils/house_price_prediction_lgb_model.pkl')
    scaler = joblib.load('/home/sushil/GharKhoji/api/utils/scaler.pkl')
    X_train_columns = joblib.load('/home/sushil/GharKhoji/api/utils/X_train_columns.pkl')

    # Parse input data
    data = json.loads(sys.argv[1])
    # Convert numeric fields from strings to the appropriate types
    numeric_fields = ['Land_area', 'Bedroom', 'Bathroom', 'No_of_Flat', 
                      'Living_Room', 'Kitchen', 'Road_size', 'Built_year', 
                      'Parking', 'Balcony', 'OverallCondition']
    for field in numeric_fields:
        data[field] = int(data[field])

    df = pd.DataFrame([data])

    # List of categorical columns for encoding
    categorical_columns = ['District', 'Direction', 'House_type']
    for column in categorical_columns:
        if column not in df.columns:
            df[column] = 'Unknown'

    # Apply one-hot encoding to categorical columns
    df = pd.get_dummies(df, columns=categorical_columns, drop_first=True)

    # Reindex to ensure the same feature columns as the training data
    df = df.reindex(columns=X_train_columns, fill_value=0)

    # Scale the features
    df_scaled = scaler.transform(df)

    # Make prediction
    prediction = model.predict(df_scaled)[0]
    
    # Print only the prediction result
    print(prediction)

if __name__ == "__main__":
    main()
