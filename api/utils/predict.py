
import sys
import json
import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler

def main():
    if len(sys.argv) < 2:
        print("No data provided")
        return

    # Load the Random Forest model and preprocessing artifacts
    model = joblib.load('/home/sushil/Downloads/GharKhoji123/api/utils/best_model.pkl')
    scaler = joblib.load('/home/sushil/Downloads/GharKhoji123/api/utils/scaler.pkl')
    X_train_columns = joblib.load('/home/sushil/Downloads/GharKhoji123/api/utils/X_train_columns.pkl')

    # Define location-based multiplication factors
    location_factors = {
        'Amarsingh': 1.05,
        'Bagar': 1.15,
        'Bijyapur': 1.10,
        'Bindabasini': 1.20,
        'Birauta': 0.90,
        'Budibazar': 0.85,
        'Chauthe': 0.95,
        'Chipledhunga': 1.25,
        'Khalte Mashina': 0.80,
        'Lakeside': 1.65 ,
        'Lekhnath': 0.90,
        'New Road': 1.30,
        'Parsyang': 1.00,
        'Phulbari': 1.10,
        'Prithvi Chowk': 1.35,
        'Zero Kilometer': 1.40,
    }

    # Parse input data
    data = json.loads(sys.argv[1])

    # Extract the location
    your_area = data.get('Yourarea')
    if your_area not in location_factors:
        print(f"Error: Location '{your_area}' is not recognized.")
        return

    # Convert numeric fields from strings to the appropriate types
    numeric_fields = ['roadsize', 'builtyear', 'area', 'bed', 'living', 'kitchen', 'bath', 'parking']
    for field in numeric_fields:
        if field in data:
            try:
                data[field] = int(data[field])
            except ValueError:
                print(f"Error: Invalid value for {field}")
                return

    df = pd.DataFrame([data])

    # List of categorical columns for encoding
    categorical_columns = ['Yourarea', 'direction', 'housetype']
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
    
    # Adjust prediction based on location
    location_factor = location_factors[your_area]
    adjusted_prediction = prediction * location_factor

    # Print only the adjusted prediction result
    print(adjusted_prediction)

if __name__ == "__main__":
    main()
