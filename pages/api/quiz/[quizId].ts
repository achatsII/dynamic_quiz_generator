import type { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = process.env.API_BASE_URL!;
const BEARER_TOKEN = process.env.BEARER_TOKEN!;
const QUIZ_DATA_TYPE = process.env.QUIZ_DATA_TYPE!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { quizId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/data/${QUIZ_DATA_TYPE}/one/${quizId}`,
      {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch quiz');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
}
