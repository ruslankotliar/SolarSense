import authMeteometics from "src/utils/authMeteomatics";
import { parse } from 'json2csv'; // You'll need to install json2csv
import { createWriteStream } from 'fs';
import { join } from 'path';

const euCountryCenters = {
    "Austria": { lat: 47.5162, lon: 14.5501 },
    "Belgium": { lat: 50.5039, lon: 4.4699 },
    "Bulgaria": { lat: 42.7339, lon: 25.4858 },
    "Croatia": { lat: 45.1000, lon: 15.2000 },
    "Cyprus": { lat: 35.1264, lon: 33.4299 },
    "Czechia": { lat: 49.8175, lon: 15.4730 },
    "Denmark": { lat: 56.2639, lon: 9.5018 },
    "Estonia": { lat: 58.5953, lon: 25.0136 },
    "France": { lat: 46.6034, lon: 1.8883 },
    "Germany": { lat: 51.1657, lon: 10.4515 },
    "Iceland": { lat: 64.9631, lon: -19.0208 },
    "Ireland": { lat: 53.1424, lon: -7.6921 },
    "Italy": { lat: 41.8719, lon: 12.5674 },
    "Latvia": { lat: 56.8796, lon: 24.6032 },
    "Lithuania": { lat: 55.1694, lon: 23.8813 },
    "Malta": { lat: 35.9375, lon: 14.3754 },
    "Netherlands": { lat: 52.1326, lon: 5.2913 },
    "Poland": { lat: 51.9194, lon: 19.1451 },
    "Portugal": { lat: 39.3999, lon: -8.2245 },
    "Romania": { lat: 45.9432, lon: 24.9668 },
    "Slovakia": { lat: 48.6690, lon: 19.6990 },
    "Slovenia": { lat: 46.1512, lon: 14.9955 },
    "Spain": { lat: 40.4637, lon: -3.7492 }
};

export default async function handler(req, res) {
    const token = await authMeteometics();
    const results = [];

    try {
        const year = 2022;
        const frequency = 'PT1H'; // Hourly data

        for (const [country, { lat, lon }] of Object.entries(euCountryCenters)) {
            const seriesRange = `${year}-01-01T13:00:00.000+01:00--${year + 1}-01-01T13:00:00.000+01:00:${frequency}`;
            const url = `https://api.meteomatics.com/${seriesRange}/uv:idx/${lat},${lon}/json?model=mix&access_token=${token}`;
            
            const meteomaticsResponse = await fetch(url);

            let newRes = { country, year, avgUV: null };

            if (!meteomaticsResponse.ok) {
                console.error(`Failed to fetch UV data for ${country} in ${year}`);
            } else {
                const { data } = await meteomaticsResponse.json();
                const allDates = data[0].coordinates[0].dates;

                // Sum all values
                const totalUV = allDates.reduce(
                    (acc, curr) => acc + parseFloat(curr.value), parseFloat(0)
                );
                
                // Calculate the average after summation
                const avgUV = totalUV / parseFloat(allDates.length);
        
                newRes = { country, year, avgUV };
                console.log("res: ", newRes, " | Dates length: ", allDates.length);
            }

            results.push(newRes);
        }

        // Generate CSV
        const csv = parse(results);
        const filePath = join(process.cwd(), 'public/avg_uv_by_country', `${year}.csv`); // Save CSV in the public directory
        const ws = createWriteStream(filePath);
        
        ws.write(csv);
        ws.end();

        // Respond with the download link
        res.status(200).json({ message: 'CSV file generated successfully', url: `/${year}.csv` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}
