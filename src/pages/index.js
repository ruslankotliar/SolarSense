import Head from 'next/head';
import Layout from '@components/Layout';
import Section from '@components/Section';
import Container from '@components/Container';
import Map from '@components/Map';
import { useEffect, useState } from 'react';
import styles from '@styles/Home.module.scss';

const DEFAULT_CENTER = [48.2081, 16.3713]; // Vienna, Austria
const MIN_YEAR = 2004;
const MAX_YEAR = 2011;
const DEFAULT_ZOOM_LVL = 4; // Example zoom level, adjust as needed
const DEFAULT_AVG_ROUND = 3;
const DEFAULT_YEAR = 2008;

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
  const [selectedYear, setSelectedYear] = useState(DEFAULT_YEAR);

  const [yearlyData, setYearlyData] = useState(null);
  const [avgUVByCountry, setAvgUVByCountry] = useState(null);

  const [imageUrl, setImageUrl] = useState('');
  const [bounds, setBounds] = useState(null);

  // useEffect(() => {
  //   const fetchUVData = async () => {
  //     try {
  //       const response = await fetch(`/api/meteomatics/uv-visual?year=${selectedYear}&bounds=${bounds.toBBoxString()}`);
  //       const data = await response.json();
  //       setImageUrl(data.image);
  //     } catch (err) {
  //       console.error("Error fetching UV data:", err);
  //     }
  //   };

  //   if (bounds && selectedYear) {
  //     fetchUVData(); // Fetch UV data whenever bounds or selected year changes
  //   }
  // }, [bounds, selectedYear]);

  // Fetch the yearly skin cancer data
  useEffect(() => {
    const fetchSkinCancerData = async () => {
      try {
        const response = await fetch('/api/skin-cancer');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const { data } = await response.json();
        setYearlyData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchAvgByCountryData = async () => {
      try {
        const response = await fetch('/api/avg-uv-by-country');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const { data } = await response.json();
        setAvgUVByCountry(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (!yearlyData) fetchSkinCancerData();
    if (!avgUVByCountry) fetchAvgByCountryData();
  }, []);

  // This was used to generate the yearly UV data for each country data set
  // const getYearlyUVDataByCountry = async (coordinates) => {
  //   try {
  //     const response = await fetch(`/api/meteomatics/avg-uv-by-country?year=${selectedYear}&coordinates=${coordinates}`);
  //     const data = await response.json();
  //     return data.avgUV;
  //   } catch (err) {
  //     console.error("Error fetching UV data by country:", err);
  //   }
  // }

  useEffect(() => {
    const fetchGeoJSON = async () => {
      const response = await fetch('leaflet/geojson/europe.geo.json');
      const data = await response.json();
      setGeoData(data);
    };

    fetchGeoJSON();
  }, []);

  const getCountryColor = (countryName) => {
    const cases = yearlyData[countryName]?.cases;
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '400px' }}>
              {/* Min Year Label */}
              <span style={{ fontSize: '14px' }}>{MIN_YEAR}</span>
              
              {/* Slider */}
              <input
                id="yearSlider"
                type="range"
                min={MIN_YEAR}
                max={MAX_YEAR}
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                style={{
                  flexGrow: 1,
                  appearance: 'none',
                  height: '6px',
                  background: `linear-gradient(to right, #1e3a8a ${(selectedYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR) * 100}%, #ddd 0%)`,  // Dark blue gradient
                  borderRadius: '5px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
              
              {/* Max Year Label */}
              <span style={{ fontSize: '14px' }}>{MAX_YEAR}</span>
            </div>
            
            {/* Display selected year */}
            <strong style={{ marginTop: '10px', fontSize: '16px' }}>
              Selected: <span style={{ color: '#1e3a8a' }}>{selectedYear}</span>
            </strong>
          </div>


          <Map className={styles.homeMap} width="1000" height="500" center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM_LVL}>
            {(props) => {
              const { TileLayer, GeoJSON, ImageOverlay, useMap } = props;

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
                  {(yearlyData && avgUVByCountry && geoData) && (
                    <GeoJSON
                      key={selectedYear}
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
                      onEachFeature={(feature, layer) => {
                        const countryName = feature.properties.name;
                        const cases = Math.round(yearlyData[selectedYear][countryName]?.cases);
                        const avg = parseFloat(avgUVByCountry[selectedYear][countryName]?.avgUV).toFixed(DEFAULT_AVG_ROUND);

                        layer.bindPopup(
                          `<strong>${countryName}</strong><br/>Cases per year: ${cases || 'N/A'}<br/>UV Index: ${avg || 'N/A'}`
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