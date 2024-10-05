import authMeteometics from "src/utils/authMeteomatics";

const euCountryCenters = {
    "Austria": { lat: 47.5162, lon: 14.5501 },
    "Belgium": { lat: 50.5039, lon: 4.4699 },
    "Bulgaria": { lat: 42.7339, lon: 25.4858 },
    "Croatia": { lat: 45.1000, lon: 15.2000 },
    "Cyprus": { lat: 35.1264, lon: 33.4299 },
    "Czech Republic": { lat: 49.8175, lon: 15.4730 },
    "Denmark": { lat: 56.2639, lon: 9.5018 },
    "Estonia": { lat: 58.5953, lon: 25.0136 },
    "Finland": { lat: 61.9241, lon: 25.7482 },
    "France": { lat: 46.6034, lon: 1.8883 },
    "Germany": { lat: 51.1657, lon: 10.4515 },
    "Greece": { lat: 39.0742, lon: 21.8243 },
    "Hungary": { lat: 47.1625, lon: 19.5033 },
    "Ireland": { lat: 53.1424, lon: -7.6921 },
    "Italy": { lat: 41.8719, lon: 12.5674 },
    "Latvia": { lat: 56.8796, lon: 24.6032 },
    "Lithuania": { lat: 55.1694, lon: 23.8813 },
    "Luxembourg": { lat: 49.8153, lon: 6.1296 },
    "Malta": { lat: 35.9375, lon: 14.3754 },
    "Netherlands": { lat: 52.1326, lon: 5.2913 },
    "Poland": { lat: 51.9194, lon: 19.1451 },
    "Portugal": { lat: 39.3999, lon: -8.2245 },
    "Romania": { lat: 45.9432, lon: 24.9668 },
    "Slovakia": { lat: 48.6690, lon: 19.6990 },
    "Slovenia": { lat: 46.1512, lon: 14.9955 },
    "Spain": { lat: 40.4637, lon: -3.7492 },
    "Sweden": { lat: 60.1282, lon: 18.6435 }
  };

export default async function handler(req, res) {
    const token = await authMeteometics();
  
    const { coordinates, year } = req.query;

    const [lat, long] = coordinates.split(',');
    
    const countryCenter = `${lat},${long}`;
  
    const seriesRange = `${Number(year)}-01-01T13:00:00.000+01:00--${Number(year) + 1}-01-01T13:00:00.000+01:00:P1D`;
    const url = `https://api.meteomatics.com/${seriesRange}/uv:idx/${countryCenter}/json?model=mix&access_token=${token}`
  
    try {
      const meteomaticsResponse = await fetch(url);
      if (!meteomaticsResponse.ok) {
        throw new Error('Failed to fetch UV data');
      }

      const { data } = await meteomaticsResponse.json();

      const avgUV = data[0].coordinates.reduce((acc, curr) => acc + curr.dates[0].value, 0) / data[0].coordinates.length;
  
      res.status(200).json({ avgUV });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }