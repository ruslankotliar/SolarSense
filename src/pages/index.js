import Head from 'next/head';
import Layout from '@components/Layout';
import Section from '@components/Section';
import Container from '@components/Container';
import Map from '@components/Map';
import Button from '@components/Button';
import { useEffect, useState } from 'react';
import styles from '@styles/Home.module.scss';

const DEFAULT_CENTER = [48.2081, 16.3713];

// Mock data for skin cancer occurrences for all European countries
const mockData = {
  Austria: { cases: 5000 },
  Belgium: { cases: 4000 },
  Bulgaria: { cases: 3000 },
  Croatia: { cases: 2000 },
  Cyprus: { cases: 1000 },
  Czechia: { cases: 4500 },
  Denmark: { cases: 5500 },
  Estonia: { cases: 500 },
  Finland: { cases: 3500 },
  France: { cases: 8000 },
  Germany: { cases: 10000 },
  Greece: { cases: 2700 },
  Hungary: { cases: 3300 },
  Ireland: { cases: 4200 },
  Italy: { cases: 7000 },
  Latvia: { cases: 900 },
  Lithuania: { cases: 1200 },
  Luxembourg: { cases: 700 },
  Malta: { cases: 500 },
  Netherlands: { cases: 6800 },
  Poland: { cases: 5400 },
  Portugal: { cases: 3100 },
  Romania: { cases: 2500 },
  Slovakia: { cases: 2200 },
  Slovenia: { cases: 1800 },
  Spain: { cases: 6000 },
  Sweden: { cases: 4900 },
};

// Function to map case numbers to a color on a gradient from light yellow to dark red
const getColorFromCases = (cases) => {
  const minCases = 500;   // Minimum number of cases
  const maxCases = 10000; // Maximum number of cases

  // Calculate the ratio between the minimum and maximum cases
  const ratio = (cases - minCases) / (maxCases - minCases);

  // Interpolate color: light yellow (for low cases) to dark red (for high cases)
  const interpolateColor = (start, end, factor) => {
    const result = start + factor * (end - start);
    return Math.round(result);
  };

  const r = interpolateColor(255, 189, ratio); // Red value from yellow (255) to dark red (189)
  const g = interpolateColor(237, 0, ratio);   // Green value from yellow (237) to dark red (0)
  const b = interpolateColor(160, 38, ratio);  // Blue value from yellow (160) to dark red (38)

  return `rgb(${r}, ${g}, ${b})`;
};

export default function Home() {
  const [geoData, setGeoData] = useState(null);

  // Fetch the GeoJSON data when the component loads
  useEffect(() => {
    const fetchGeoJSON = async () => {
      const response = await fetch('leaflet/geojson/europe.geo.json'); // Path to your GeoJSON file
      const data = await response.json();
      setGeoData(data);
    };
    fetchGeoJSON();
  }, []);

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
          <Map className={styles.homeMap} width="800" height="400" center={DEFAULT_CENTER} zoom={4}>
            {({ TileLayer, GeoJSON }) => (
              <>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                />
                {geoData && (
                  <GeoJSON
                    data={geoData} // The GeoJSON data you fetched
                    style={(feature) => {
                      // Extract the country name and apply a dynamic style
                      const countryName = feature.properties.name;
                      return {
                        fillColor: getCountryColor(countryName), // Use dynamic color based on cases
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.7,
                      };
                    }}
                    onEachFeature={(feature, layer) => {
                      const countryName = feature.properties.name;
                      const population = feature.properties.pop_est || 'N/A';
                      const gdp = feature.properties.gdp_md || 'N/A';
                      const cases = mockData[countryName]?.cases || 'N/A';
                      
                      // Bind popup content with more detailed information
                      layer.bindPopup(`
                        <strong>${countryName}</strong><br/>
                        Population: ${population}<br/>
                        GDP (Million USD): ${gdp}<br/>
                        Skin Cancer Cases: ${cases}
                      `);
                    }}
                  />
                )}
              </>
            )}
          </Map>
        </Container>
      </Section>
    </Layout>
  );
}
