import Head from 'next/head';
import Layout from '@components/Layout';
import Section from '@components/Section';
import Container from '@components/Container';
import Map from '@components/Map';
import { useEffect, useState } from 'react';
import styles from '@styles/Home.module.scss';

const DEFAULT_CENTER = [48.2081, 16.3713];

const euCountryCenters = {
  "Austria": { lat: 47.5162, lon: 14.5501 },
  // "Belgium": { lat: 50.5039, lon: 4.4699 },
  // "Bulgaria": { lat: 42.7339, lon: 25.4858 },
  // "Croatia": { lat: 45.1000, lon: 15.2000 },
  // "Cyprus": { lat: 35.1264, lon: 33.4299 },
  // "Czech Republic": { lat: 49.8175, lon: 15.4730 },
  // "Denmark": { lat: 56.2639, lon: 9.5018 },
  // "Estonia": { lat: 58.5953, lon: 25.0136 },
  // "Finland": { lat: 61.9241, lon: 25.7482 },
  // "France": { lat: 46.6034, lon: 1.8883 },
  // "Germany": { lat: 51.1657, lon: 10.4515 },
  // "Greece": { lat: 39.0742, lon: 21.8243 },
  // "Hungary": { lat: 47.1625, lon: 19.5033 },
  // "Ireland": { lat: 53.1424, lon: -7.6921 },
  // "Italy": { lat: 41.8719, lon: 12.5674 },
  // "Latvia": { lat: 56.8796, lon: 24.6032 },
  // "Lithuania": { lat: 55.1694, lon: 23.8813 },
  // "Luxembourg": { lat: 49.8153, lon: 6.1296 },
  // "Malta": { lat: 35.9375, lon: 14.3754 },
  // "Netherlands": { lat: 52.1326, lon: 5.2913 },
  // "Poland": { lat: 51.9194, lon: 19.1451 },
  // "Portugal": { lat: 39.3999, lon: -8.2245 },
  // "Romania": { lat: 45.9432, lon: 24.9668 },
  // "Slovakia": { lat: 48.6690, lon: 19.6990 },
  // "Slovenia": { lat: 46.1512, lon: 14.9955 },
  // "Spain": { lat: 40.4637, lon: -3.7492 },
  // "Sweden": { lat: 60.1282, lon: 18.6435 }
};


// Mock data for different years
const yearlyMockData = {
  2020: {
    Austria: { cases: 5000 },
    Belgium: { cases: 4000 },
    Bulgaria: { cases: 3000 },
    Croatia: { cases: 2000 },
    Cyprus: { cases: 1000 },
    Czechia: { cases: 4500 },
    Denmark: { cases: 5500 },
    Estonia: { cases: 500 },
  },
  2021: {
    Austria: { cases: 5200 },
    Belgium: { cases: 3900 },
    Bulgaria: { cases: 2800 },
    Croatia: { cases: 2100 },
    Cyprus: { cases: 1100 },
    Czechia: { cases: 4600 },
    Denmark: { cases: 5700 },
    Estonia: { cases: 550 },
  },
  2022: {
    Austria: { cases: 5300 },
    Belgium: { cases: 4100 },
    Bulgaria: { cases: 2900 },
    Croatia: { cases: 2200 },
    Cyprus: { cases: 1200 },
    Czechia: { cases: 4700 },
    Denmark: { cases: 5900 },
    Estonia: { cases: 600 },
  },
};

const zoomLevel = 4; // Example zoom level, adjust as needed

// Function to map case numbers to a color on a gradient from light yellow to dark red
const getColorFromCases = (cases) => {
  const minCases = 500;
  const maxCases = 10000;

  const ratio = (cases - minCases) / (maxCases - minCases);

  const interpolateColor = (start, end, factor) => {
    return Math.round(start + factor * (end - start));
  };

  const r = interpolateColor(255, 189, ratio);
  const g = interpolateColor(237, 0, ratio);
  const b = interpolateColor(160, 38, ratio);

  return `rgb(${r}, ${g}, ${b})`;
};

export default function Home() {
  const [geoData, setGeoData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2022);
  const [mockData, setMockData] = useState(yearlyMockData[selectedYear]);
  const [imageUrl, setImageUrl] = useState('');
  const [bounds, setBounds] = useState(null);
  const [avgUVByCountry, setAvgUVByCountry] = useState(null);

  useEffect(() => {
    const fetchUVData = async () => {
      try {
        const response = await fetch(`/api/meteomatics/getUVData?year=${selectedYear}&bounds=${bounds.toBBoxString()}`);
        const data = await response.json();
        setImageUrl(data.image);
      } catch (err) {
        console.error("Error fetching UV data:", err);
      }
    };

    if (bounds) {
      fetchUVData(); // Fetch UV data whenever bounds change
    }
  }, [bounds]);

  const getYearlyUVDataByCountry = async (coordinates) => {
    try {
      const response = await fetch(`/api/meteomatics/getYearlyUVDataByCountry?year=${selectedYear}&coordinates=${coordinates}`);
      const data = await response.json();
      return data.avgUV;
    } catch (err) {
      console.error("Error fetching UV data by country:", err);
    }
  }

  useEffect(() => {
    const fetchGeoJSON = async () => {
      const response = await fetch('leaflet/geojson/europe.geo.json');
      const data = await response.json();
      setGeoData(data);
    };

    fetchGeoJSON();
  }, []);

  useEffect(() => {
    setMockData(yearlyMockData[selectedYear]);
  }, [selectedYear]);

  useEffect(() => {
    const fetchAvgUVDataByCountry = async () => {
      const avgData = await Promise.all(
        Object.entries(euCountryCenters).map(async ([countryName, { lat, lon }]) => {
          const uvData = await getYearlyUVDataByCountry(`${lat},${lon}`);
          return { countryName, uvData };
        })
      );

      // Convert the array of results to an object
      const avgUVByCountry = avgData.reduce((acc, { countryName, uvData }) => {
        if (uvData) acc[countryName] = uvData;
        return acc;
      }, {});

      setAvgUVByCountry(Object.keys(avgUVByCountry).length ? avgUVByCountry : null);
    };

    if (!avgUVByCountry) {
      fetchAvgUVDataByCountry();
    }
  }, [avgUVByCountry]);


  const getCountryColor = (countryName) => {
    const cases = mockData[countryName]?.cases;
    return cases ? getColorFromCases(cases) : 'gray';
  };

  return (
    <Layout>
      <Head>
        <title>Solar Sense</title>
        <meta name="description" content="Create mapping apps with Solar Sense" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Section>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <label htmlFor="yearSlider">Select Year: </label>
              <input
                id="yearSlider"
                type="range"
                min={2015}
                max={2022}
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                style={{ width: '300px' }}
              />
              <span style={{ marginLeft: '10px' }}>{selectedYear}</span>
            </div>
          </div>

          <Map className={styles.homeMap} width="800" height="400" center={DEFAULT_CENTER} zoom={zoomLevel}>
            {(props) => {
              const { TileLayer, GeoJSON, ImageOverlay, Rectangle, useMap } = props;

              return (
                <>
                  {/* Use the map bounds hook here */}
                  <MapWithBounds useMap={useMap} setBounds={setBounds} /> 

                  {/* TileLayer (background map layer) */}
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                  />

                  {/* UV Index ImageOverlay */}
                  {(imageUrl && bounds) && (
                    <ImageOverlay
                      url={imageUrl}
                      bounds={bounds}
                      opacity={0.6}
                      zIndex={1000}
                    />
                  )}

                  {/* GeoJSON Layer */}
                  {(avgUVByCountry && geoData) && (
                    <GeoJSON
                      data={geoData}
                      style={(feature) => ({
                        fillColor: getCountryColor(feature.properties.name),
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.7,
                        zIndex: 500,
                      })}
                      onEachFeature={async (feature, layer) => {
                        const countryName = feature.properties.name;

                        layer.bindPopup(
                          `<strong>${countryName}</strong><br/>Cases: ${mockData[countryName]?.cases || 'N/A'}<br/>UV Index: ${avgUVByCountry[countryName] || 'N/A'}`
                        );
                      }}
                    />
                  )}
                </>
            )}}
          </Map>
        </Container>
      </Section>
    </Layout>
  );
}


// Function to access bounds using the useMap hook
function MapWithBounds({ useMap, setBounds }) {
  const map = useMap(); // Get the map instance

  map.on('zoomend', function() {
    setBounds(map.getBounds()); // Set the bounds in the parent component
  });

  map.on('moveend', function() {
    setBounds(map.getBounds()); // Set the bounds in the parent component
  });

  useEffect(() => {
    setBounds(map.getBounds()); // Set the bounds in the parent component
  }, [map]);

  return null; // You can render something or just use this hook for side effects
}