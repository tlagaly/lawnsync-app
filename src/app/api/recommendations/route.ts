import { NextResponse } from 'next/server';
import { generateRecommendations } from '@/lib/recommendations';
import { prisma } from '@/lib/db';
import { getCurrentWeather } from '@/lib/weather';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LawnProfile } from '@/types/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's lawn profile
    const profile = await prisma.lawnProfile.findUnique({
      where: { email: session.user.email }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Lawn profile not found' },
        { status: 404 }
      );
    }

    // Map Prisma model to our domain type
    const lawnProfile: LawnProfile = {
      id: profile.id,
      size: profile.lawnSize,
      grassType: profile.grassType,
      location: profile.location,
      userId: session.user.id,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      sunExposure: 'full' // Default value since it's not in DB yet
    };

    // Get current weather for the user's location
    const weather = await getCurrentWeather(profile.location);
    
    // Generate recommendations
    const recommendations = await generateRecommendations(lawnProfile, weather);

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}