import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';
import Layout from '@components/Layout';
import Section from '@components/Section';
import Container from '@components/Container';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function ChartPage() {
  const [yearlyData, setYearlyData] = useState(null);
  const [avgUVByCountry, setAvgUVByCountry] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('Austria');
  const [availableCountries, setAvailableCountries] = useState([]);

  // Fetch data
  useEffect(() => {
    const fetchSkinCancerData = async () => {
      try {
        const response = await fetch('/api/skin-cancer');
        if (!response.ok) throw new Error('Network response was not ok');
        const { data } = await response.json();
        setYearlyData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchAvgByCountryData = async () => {
      try {
        const response = await fetch('/api/avg-uv-by-country');
        if (!response.ok) throw new Error('Network response was not ok');
        const { data } = await response.json();
        setAvgUVByCountry(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (!yearlyData) fetchSkinCancerData();
    if (!avgUVByCountry) fetchAvgByCountryData();
  }, []);

  // Extract countries from data
  useEffect(() => {
    if (avgUVByCountry && yearlyData) {
      const countries = Object.keys(avgUVByCountry["2004"]);
      setAvailableCountries(countries);
    }
  }, [avgUVByCountry, yearlyData]);

  // Transform data for charts
  const transformChartData = (dataset1, dataset2, selectedCountry) => {
    const years = Object.keys(dataset1);
    const avgUVData = years.map((year) =>
      dataset1[year][selectedCountry]?.avgUV || null
    );
    const casesData = years.map((year) =>
      dataset2[year][selectedCountry]?.cases || null
    );

    // Line chart data
    setChartData({
      labels: years,
      datasets: [
        {
          label: 'Avg UV',
          data: avgUVData,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          yAxisID: 'y1',
        },
        {
          label: 'Cases',
          data: casesData,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          yAxisID: 'y2',
        },
      ],
    });

    // Bar chart data
    setBarChartData({
      labels: years,
      datasets: [
        {
          label: 'Avg UV',
          data: avgUVData,
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          yAxisID: 'y1', // Bind to the left y-axis
        },
        {
          label: 'Cases',
          data: casesData,
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          yAxisID: 'y2', // Bind to the right y-axis
        },
      ],
    });
  };

  // Update chart when country or data changes
  useEffect(() => {
    if (yearlyData && avgUVByCountry) {
      transformChartData(avgUVByCountry, yearlyData, selectedCountry);
    }
  }, [yearlyData, avgUVByCountry, selectedCountry]);

  if (!chartData || !barChartData || availableCountries.length === 0) {
    return <div>Loading chart...</div>;
  }

  return (
    <Layout>
        <Section style={{ height: '100%' }}>
        <Container style={{ height: '100%', margin: '0', width: '100%', maxWidth: '100%'}}>
            <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '20px',
                gap: '20px',
            }}>
                <h2 style={{
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                }}>UV Index and Skin Cancer Incidents <strong style={{color: '#1e3a8a'}}>Comparison</strong></h2>

                <div style={{
                borderRadius: '8px',
                background: '#f0f4f8',
                padding: '10px 20px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                }}>
                <label htmlFor="country-select" style={{
                    marginRight: '10px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                }}>Select a country:</label>
                <select
                    id="country-select"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    backgroundColor: '#fff',
                    fontSize: '14px',
                    }}
                >
                    {availableCountries.map((country) => (
                    <option key={country} value={country}>
                        {country}
                    </option>
                    ))}
                </select>
                </div>
            </div>

            <div style={{
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                width: '100%',
                height: '50%',
            }}>
                <div style={{
                flex: '1 1 300px', // Allows the chart to be responsive and grow/shrink
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}>
                {/* Line Chart */}
                <Line
                    data={chartData}
                    options={{
                    responsive: true,
                    maintainAspectRatio: false, // Allows for better responsiveness
                    scales: {
                        y1: {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'Avg UV' },
                        },
                        y2: {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Cases' },
                        },
                    },
                    }}
                />
                </div>

                <div style={{
                flex: '1 1 300px', // Allows the chart to be responsive and grow/shrink
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}>
                {/* Bar Chart */}
                <Bar
                    data={barChartData}
                    options={{
                    responsive: true,
                    maintainAspectRatio: false, // Allows for better responsiveness
                    scales: {
                        y1: {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'Avg UV' },
                        grid: { drawOnChartArea: false },
                        },
                        y2: {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Cases' },
                        },
                    },
                    }}
                />
                </div>
            </div>
        </Container>
        </Section>
    </Layout>
  );
}
