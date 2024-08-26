import numpy as np
import pandas as pd
import random

# Define features and their possible values
locations = ['Lekhnath', 'Birauta', 'Zero Kilometer', 'Bagar', 'Chipledhunga', 'Bindabasini', 
             'Chauthe', 'Parsyang', 'Amarsingh', 'Lakeside', 'Prithvi Chowk', 'Budibazar', 
             'New Road', 'Bijyapur', 'Phulbari']

directions = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West']
house_types = ['Apartment', 'Villa', 'Bungalow', 'Cottage', 'Residential', 'Semi-commercial', 'Commercial']

# Define base price per square foot for each location (based on proximity to key areas and desirability)
location_price_per_sqft = {
    'Lekhnath': 5200,  # Increased slightly
    'Birauta': 3900,
    'Zero Kilometer': 12000,
    'Bagar': 4500,
    'Chipledhunga': 10400,
    'Bindabasini': 9000,
    'Chauthe': 7100,
    'Parsyang': 4800,
    'Amarsingh': 9300,
    'Lakeside': 26000 ,  # Updated price per sqft for Lakeside
    'Prithvi Chowk': 11500,
    'Budibazar': 3600,
    'New Road': 15500,
    'Bijyapur': 4900,
    'Phulbari': 5000
}

# Multiplier for high-demand locations (e.g., prestigious or central areas)
location_multipliers = {
    'Lekhnath': 1.05,  # Slightly increased
    'Birauta': 1.23,
    'Zero Kilometer': 1.45,
    'Bagar': 1.07,
    'Chipledhunga': 1.22,
    'Bindabasini': 1.27,
    'Chauthe': 1.02,
    'Parsyang': 1.14,
    'Amarsingh': 1.02,
    'Lakeside': 1.75,
    'Prithvi Chowk': 1.38,
    'Budibazar': 1.08,
    'New Road': 1.42,
    'Bijyapur': 1.01,
    'Phulbari': 1.0
}

# Additional factors that influence pricing
poi_influence = {  # Influence of proximity to points of interest
    'school': 0.05,  # 5% price increase if near schools
    'hospital': 0.07,  # 7% price increase if near hospitals
    'shopping_center': 0.08  # 8% price increase if near shopping centers
}

# Function to calculate price adjustment based on proximity to key points of interest
def adjust_for_poi(base_price):
    adjustment = 1
    for factor, influence in poi_influence.items():
        if random.random() < 0.3:  # 30% probability of proximity to each POI
            adjustment += influence
    return base_price * adjustment

# Function to generate random house data with enhanced realism
def generate_advanced_house_data(n=8000):
    data = []
    
    for _ in range(n):
        location = random.choice(locations)
        
        # Generate features with more context-aware ranges
        road_size = random.randint(8, 30)  # in feet
        built_year = random.randint(2060, 2080)
        area = random.randint(500, 15000)  # in square feet
        beds = random.randint(1, 15)
        living_rooms = max(1, beds // 2)  # Ensure living rooms are at most half the number of bedrooms
        kitchens = random.randint(1, max(1, min(beds - 1, 5)))  # Ensure valid range
        baths = random.randint(1, max(1, min(beds - 1, 5)))  # Bathrooms <= bedrooms
        direction = random.choice(directions)
        house_type = random.choice(house_types)
        parking = random.randint(0, 5)  # Range for parking variability
        
        # Get the base price per square foot based on location
        base_price_per_sqft = location_price_per_sqft[location]
        
        # Calculate base price with land area as a dominant factor
        base_price = area * base_price_per_sqft
        
        # Apply location-based multiplier
        location_multiplier = location_multipliers[location]
        base_price *= location_multiplier
        
        # Apply a general price increase margin (e.g., 10% overall increase)
        base_price *= 1.1
        
        # Adjust price based on road size, built year, and location
        road_multiplier = 1 + (road_size - 8) / 30 * 0.1  # Road size effect (up to 10% price boost)
        year_multiplier = 1 + (built_year - 2060) / 20 * 0.1  # Newer homes get up to 10% boost
        
        # Adjust price based on house type (premium properties)
        house_type_multiplier = 1.15 if house_type in ['Villa', 'Bungalow'] else 1
        
        # Calculate final price by applying multipliers
        price = base_price * road_multiplier * year_multiplier * house_type_multiplier
        
        # Adjust for proximity to points of interest (e.g., schools, hospitals)
        price = adjust_for_poi(price)
        
        # Add noise for real-world behavior
        noise = random.uniform(-0.25, 0.25)  # Slightly reduced noise range for realism
        price *= (1 + noise)
        
        # Ensure price is non-negative and round it
        price = max(0, int(round(price)))
        
        # Append the generated house data to the list
        data.append([location, road_size, built_year, area, beds, living_rooms, kitchens, baths, 
                     direction, house_type, parking, price])
    
    # Create a DataFrame from the generated data
    df = pd.DataFrame(data, columns=['Yourarea', 'RoadSize', 'BuiltYear', 'Area', 'Bed', 'Living', 
                                     'Kitchen', 'Bath', 'Direction', 'HouseType', 'Parking', 'Price'])
    
    return df

# Generate 2,000 data points with advanced realism
df = generate_advanced_house_data(n=5000)

# Display first few rows
print(df.head())

# Save to CSV
df.to_csv('44444444442221h_noise.csv', index=False)
