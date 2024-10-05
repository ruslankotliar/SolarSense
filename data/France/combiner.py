import os
import pandas as pd

# Define the folder where your CSV files are stored
folder_path = os.path.join(os.path.expanduser('~'), 'Downloads/solar-sense/data/France')  # Path to Downloads folder

# Define the path for the output CSV file
output_file = '~/Downloads/solar-sense/data/out/France.csv'

# Try to read the existing data if the file exists
if os.path.exists(output_file):
    existing_df = pd.read_csv(output_file)
else:
    existing_df = pd.DataFrame()  # Create an empty DataFrame if the file does not exist

# Create an empty list to hold each country's DataFrame
combined_data = []

# Set to track new countries
new_countries = set()

# Iterate over each CSV file in the folder
for filename in os.listdir(folder_path):
    if filename.endswith(".csv"):
        file_path = os.path.join(folder_path, filename)
        print(f"Processing file: {filename}")  # Debugging output
        try:
            # Read the CSV file, skip bad lines, and specify the delimiter if necessary
            df = pd.read_csv(file_path, skiprows=2, sep=',')  # Skips lines with errors
            print(df.columns)

            # Check if the necessary columns exist
            if 'Years' in df.columns and 'Number' in df.columns:
                # Select only the required columns
                df = df[['Years', 'Number']]
                
                
                #df['country'] = filename.replace('.csv', '')
                df['country'] = "France"
                #country = filename.replace('.csv', '')
                country = "France"
               
                
                # Append the DataFrame to the list
                combined_data.append(df)
                
                # Add the country to the set of new countries
                new_countries.add(country)
            else:
                print(f"File {filename} does not contain 'Years' or 'Number' columns.")
        except Exception as e:
            print(f"Error processing file {filename}: {e}")

# Combine all DataFrames into one if there are any
if combined_data:
    new_data_df = pd.concat(combined_data, ignore_index=True)  # Concatenate the new data
    
    # Append new data to existing data
    combined_df = pd.concat([existing_df, new_data_df], ignore_index=True)
    
    # Export to the output CSV file
    combined_df.to_csv(output_file, index=False)

    # Print out the new countries added
    if new_countries:
        print("New countries added:", ', '.join(new_countries))
else:
    print("No new data to combine.")

