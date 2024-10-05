import authMeteometics from "src/utils/authMeteomatics";

export default async function handler(req, res) {
  const token = await authMeteometics();

  const { year, bounds } = req.query;
  
  // 'southwest_lng,southwest_lat,northeast_lng,northeast_lat'
  const [southwestLng, southwestLat, northeastLng, northeastLat] = bounds.split(',');

  const date = `${year}-07-01T13:00:00.000+01:00`;
  const url = `https://api.meteomatics.com/${date}/uv:idx/${northeastLat},${southwestLng}_${southwestLat},${northeastLng}:0.1,0.1/png?model=mix&access_token=${token}`

  try {
    const meteomaticsResponse = await fetch(url);
    if (!meteomaticsResponse.ok) {
      throw new Error('Failed to fetch UV data');
    }

    // Read the response body as a buffer
    const buffer = await meteomaticsResponse.arrayBuffer();

    // Convert ArrayBuffer to Buffer (Node.js Buffer)
    const bufferNode = Buffer.from(buffer);

    // Convert Buffer to Base64 string
    const base64Image = bufferNode.toString('base64');

    // Send the Base64 string as a response
    res.status(200).json({ image: `data:image/png;base64,${base64Image}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}
