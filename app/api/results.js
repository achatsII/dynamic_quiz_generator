// Vercel Serverless Function - Get all results (admin)
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      `${process.env.API_BASE_URL}/data/${process.env.QUIZ_RESULT_DATA_TYPE}/filter`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mongo_filter: {
            "json_data.app_identifier": { "$eq": process.env.APP_IDENTIFIER }
          }
        })
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch results' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
