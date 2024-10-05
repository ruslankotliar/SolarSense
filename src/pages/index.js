import Head from 'next/head';
import Layout from '@components/Layout';
import Section from '@components/Section';
import Container from '@components/Container';
import Map from '@components/Map';
import { useEffect, useState } from 'react';
import styles from '@styles/Home.module.scss';

const DEFAULT_CENTER = [48.2081, 16.3713];

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
    Finland: { cases: 3400 },
    France: { cases: 8200 },
    Germany: { cases: 1000 },
    Greece: { cases: 2900 },
    Hungary: { cases: 3200 },
    Ireland: { cases: 4300 },
    Italy: { cases: 7100 },
    Latvia: { cases: 950 },
    Lithuania: { cases: 1250 },
    Luxembourg: { cases: 800 },
    Malta: { cases: 600 },
    Netherlands: { cases: 6900 },
    Poland: { cases: 5500 },
    Portugal: { cases: 3000 },
    Romania: { cases: 2600 },
    Slovakia: { cases: 2300 },
    Slovenia: { cases: 1900 },
    Spain: { cases: 6100 },
    Sweden: { cases: 5000 },
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
    Finland: { cases: 3600 },
    France: { cases: 8500 },
    Germany: { cases: 10500 },
    Greece: { cases: 3100 },
    Hungary: { cases: 3400 },
    Ireland: { cases: 4400 },
    Italy: { cases: 7200 },
    Latvia: { cases: 1000 },
    Lithuania: { cases: 1300 },
    Luxembourg: { cases: 900 },
    Malta: { cases: 700 },
    Netherlands: { cases: 7000 },
    Poland: { cases: 5700 },
    Portugal: { cases: 3200 },
    Romania: { cases: 2700 },
    Slovakia: { cases: 2400 },
    Slovenia: { cases: 2000 },
    Spain: { cases: 6200 },
    Sweden: { cases: 5100 },
  },
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
  const [selectedYear, setSelectedYear] = useState(2020); // Default year
  const [mockData, setMockData] = useState(yearlyMockData[selectedYear]);

  // Fetch the GeoJSON data when the component loads
  useEffect(() => {
    const fetchGeoJSON = async () => {
      const response = await fetch('leaflet/geojson/europe.geo.json'); // Path to your GeoJSON file
      const data = await response.json();
      setGeoData(data);
    };
    fetchGeoJSON();
  }, []);

  // Update the data when the selected year changes
  useEffect(() => {
    setMockData(yearlyMockData[selectedYear]);
  }, [selectedYear]);

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
          {/* Year Selector */}
          <div>
            <label htmlFor="yearSelect">Select Year: </label>
            <select
              id="yearSelect"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              <option value={2020}>2020</option>
              <option value={2021}>2021</option>
              <option value={2022}>2022</option>
              {/* Add more years as needed */}
            </select>
          </div>

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
                        Skin Cancer Cases in ${selectedYear}: ${cases}
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
