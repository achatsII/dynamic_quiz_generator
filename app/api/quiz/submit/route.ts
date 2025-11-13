import { NextRequest, NextResponse } from 'next/server';

// POST submit quiz result
export async function POST(request: NextRequest) {
  try {
    const result = await request.json();

    const response = await fetch(
      `${process.env.API_BASE_URL}/data/${process.env.QUIZ_RESULT_DATA_TYPE}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: `Result for ${result.userName} on quiz ${result.quizTitle}`,
          json_data: { ...result, app_identifier: process.env.APP_IDENTIFIER },
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to submit result' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error submitting result:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
