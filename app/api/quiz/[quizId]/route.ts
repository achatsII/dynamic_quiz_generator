import { NextRequest, NextResponse } from 'next/server';

// GET quiz by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await params;
  
  try {
    const response = await fetch(
      `${process.env.API_BASE_URL}/data/${process.env.QUIZ_DATA_TYPE}/one/${quizId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
