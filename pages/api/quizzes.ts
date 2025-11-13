import type { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = process.env.API_BASE_URL!;
const BEARER_TOKEN = process.env.BEARER_TOKEN!;
const QUIZ_DATA_TYPE = process.env.QUIZ_DATA_TYPE!;
const APP_IDENTIFIER = process.env.APP_IDENTIFIER!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Get all quizzes
    try {
      const response = await fetch(
        `${API_BASE_URL}/data/${QUIZ_DATA_TYPE}/filter`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mongo_filter: {
              "json_data.app_identifier": { "$eq": APP_IDENTIFIER }
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
  } else if (req.method === 'POST') {
    // Create quiz
    try {
      const quiz = req.body;

      const response = await fetch(
        `${API_BASE_URL}/data/${QUIZ_DATA_TYPE}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: `Quiz: ${quiz.title}`,
            json_data: { ...quiz, app_identifier: APP_IDENTIFIER },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create quiz');
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create quiz' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
