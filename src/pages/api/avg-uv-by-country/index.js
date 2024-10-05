// pages/api/avgUV.js
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export default async function handler(_, res) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'avg_uv_by_country', 'data.csv');

    const results = {};

    // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const country = row.country;
        // Loop through each year in the CSV row
        for (const [year, value] of Object.entries(row)) {
          if (year !== 'country' && value) { // Skip the 'country' column and empty values
            if (!results[year]) {
              results[year] = {};
            }
            results[year][country] = { cases: parseFloat(value) }; // Store values as numbers
          }
        }
      })
      .on('end', () => {
        res.status(200).json({ data: results });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}
