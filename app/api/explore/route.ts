import { NextRequest, NextResponse } from 'next/server';
import { BeliefSet, Property, ExploreResult } from '@/app/types/beliefset';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { beliefSet, properties }: { beliefSet: BeliefSet; properties: Property[] } = body;

    // Call the server's /exploreBeliefSet endpoint
    const serverUrl = 'http://localhost:3001/exploreBeliefSet';

    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        beliefSet,
        explore: properties
      })
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const result: ExploreResult = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calling explore endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to explore belief set' },
      { status: 500 }
    );
  }
}
