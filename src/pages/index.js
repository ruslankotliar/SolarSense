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
const YEARS_AHEAD = 11;

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
  const [showUVIndex, setShowUVIndex] = useState(false);

  const [yearlyData, setYearlyData] = useState(null);
  const [avgUVByCountry, setAvgUVByCountry] = useState(null);

  const [imageUrl, setImageUrl] = useState('');
  const [bounds, setBounds] = useState(null);

  useEffect(() => {
    const fetchUVData = async () => {
      try {
        const response = await fetch(`/api/meteomatics/uv-visual?year=${selectedYear + YEARS_AHEAD}&bounds=${bounds.toBBoxString()}`);
        const data = await response.json();
        setImageUrl(data.image);
      } catch (err) {
        console.error("Error fetching UV data:", err);
      }
    };

    if (bounds && selectedYear) {
      fetchUVData(); // Fetch UV data whenever bounds or selected year changes
    }
  }, [bounds, selectedYear]);

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
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            width: '100%', 
            marginBottom: '40px', 
            alignItems: 'center' 
          }}>
            {/* Left side: Slider and Year */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Slider Container */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%', maxWidth: '400px' }}>
                {/* Min Year Label */}
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{MIN_YEAR}</span>
                
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
                    height: '8px',
                    background: `linear-gradient(to right, #1e3a8a ${(selectedYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR) * 100}%, #ddd 0%)`,
                    borderRadius: '8px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
                
                {/* Max Year Label */}
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{MAX_YEAR}</span>
              </div>

              {/* Selected Year Display */}
              <p style={{ marginTop: '10px', fontSize: '16px' }}>
                Selected: <strong style={{color: '#1e3a8a'}}>{selectedYear}</strong>
              </p>
            </div>

            {/* Right side: UV Index Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer', color: '#333' }}>
                <input
                  type="checkbox"
                  checked={showUVIndex}
                  onChange={(e) => setShowUVIndex(e.target.checked)}
                  style={{
                    marginRight: '10px',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                  }}
                />
                Show UV Index
              </label>
            </div>
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
                  {(imageUrl && bounds && showUVIndex) && (
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