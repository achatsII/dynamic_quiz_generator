import { NextResponse } from 'next/server';

// GET all results
export async function GET() {
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
      return NextResponse.json({ error: 'Failed to fetch results' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
