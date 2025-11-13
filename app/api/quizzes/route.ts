import { NextRequest, NextResponse } from 'next/server';

// GET all quizzes
export async function GET() {
  try {
    const response = await fetch(
      `${process.env.API_BASE_URL}/data/${process.env.QUIZ_DATA_TYPE}/filter`,
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
      return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create quiz
export async function POST(request: NextRequest) {
  try {
    const quiz = await request.json();

    const response = await fetch(
      `${process.env.API_BASE_URL}/data/${process.env.QUIZ_DATA_TYPE}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: `Quiz: ${quiz.title}`,
          json_data: { ...quiz, app_identifier: process.env.APP_IDENTIFIER },
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to create quiz' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
